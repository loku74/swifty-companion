/**
 * Minimal client for the 42 API (v2), authenticated with the intra OAuth2
 * client-credentials flow.
 *
 * A single access token is cached and shared by every request. It is only
 * re-created when it is about to expire, or when the API rejects it (401).
 */

const API_URL = "https://api.intra.42.fr";
const CLIENT_ID = process.env.EXPO_PUBLIC_FT_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FT_CLIENT_SECRET;

/** Refresh the token slightly before it actually expires. */
const EXPIRY_MARGIN_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type ApiErrorKind =
  | "invalid-login"
  | "config"
  | "network"
  | "timeout"
  | "not-found"
  | "unauthorized"
  | "rate-limited"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(
    "unknown",
    error instanceof Error ? error.message : "Something went wrong.",
  );
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

export type Token = {
  accessToken: string;
  /** Epoch ms, as measured by this device. */
  createdAt: number;
  expiresAt: number;
};

let token: Token | null = null;
let pendingToken: Promise<Token> | null = null;
const tokenListeners = new Set<() => void>();

function setToken(next: Token | null) {
  token = next;
  for (const listener of tokenListeners) listener();
}

/** For `useSyncExternalStore`. */
export function subscribeToToken(listener: () => void) {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

export function getCurrentToken() {
  return token;
}

export function hasCredentials() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

function isTokenValid(candidate: Token | null): candidate is Token {
  return (
    candidate !== null && Date.now() < candidate.expiresAt - EXPIRY_MARGIN_MS
  );
}

function formEncode(values: Record<string, string>) {
  return Object.entries(values)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

async function requestToken(): Promise<Token> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new ApiError(
      "config",
      "Missing 42 API credentials. Copy .env.example to .env, fill in your app UID and secret, then restart the dev server.",
    );
  }

  const response = await request(`${API_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formEncode({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (response.status === 400 || response.status === 401) {
    throw new ApiError(
      "unauthorized",
      "The 42 API rejected the app credentials. Check .env — the secret may have expired and need to be regenerated on the intra.",
    );
  }
  await throwForStatus(response);

  const body: { access_token: string; expires_in: number } =
    await response.json();
  const now = Date.now();
  return {
    accessToken: body.access_token,
    createdAt: now,
    expiresAt: now + body.expires_in * 1000,
  };
}

/**
 * Returns the cached token, or creates a new one if it is missing or expired.
 * Concurrent callers share the same in-flight token request.
 */
export async function getToken(): Promise<Token> {
  if (isTokenValid(token)) return token;

  pendingToken ??= requestToken()
    .then((next) => {
      setToken(next);
      return next;
    })
    .finally(() => {
      pendingToken = null;
    });

  return pendingToken;
}

/** Drops the cached token; the next request creates a new one. */
export function invalidateToken() {
  setToken(null);
}

// Debug helpers, used by the Session tab to demonstrate token renewal.

/** Marks the cached token as expired without touching the API. */
export function expireTokenNow() {
  if (token) setToken({ ...token, expiresAt: Date.now() });
}

/** Replaces the cached token with a bogus one, as if it had been revoked server-side. */
export function corruptToken() {
  if (token) setToken({ ...token, accessToken: "revoked-token" });
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

async function request(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError(
        "timeout",
        "The 42 API took too long to respond. Please try again.",
      );
    }
    throw new ApiError(
      "network",
      "Could not reach the 42 API. Check your internet connection.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function throwForStatus(response: Response) {
  if (response.ok) return;

  if (response.status === 404) {
    throw new ApiError("not-found", "Not found.");
  }
  if (response.status === 429) {
    throw new ApiError(
      "rate-limited",
      "Too many requests to the 42 API. Wait a moment and try again.",
    );
  }
  if (response.status >= 500) {
    throw new ApiError(
      "server",
      `The 42 API is having trouble (HTTP ${response.status}). Try again later.`,
    );
  }
  throw new ApiError(
    "unknown",
    `Unexpected response from the 42 API (HTTP ${response.status}).`,
  );
}

async function apiGet<T>(path: string, canRetry = true): Promise<T> {
  const { accessToken } = await getToken();
  const response = await request(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // The token was revoked or expired early: get a new one and retry once.
  if (response.status === 401 && canRetry) {
    invalidateToken();
    return apiGet<T>(path, false);
  }
  if (response.status === 401) {
    throw new ApiError("unauthorized", "The 42 API refused the access token.");
  }
  await throwForStatus(response);

  return response.json();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export type Skill = { id: number; name: string; level: number };

export type CursusUser = {
  id: number;
  level: number;
  grade: string | null;
  begin_at: string;
  end_at: string | null;
  cursus_id: number;
  cursus: { id: number; name: string; slug: string };
  skills: Skill[];
};

export type ProjectUser = {
  id: number;
  final_mark: number | null;
  status: string;
  "validated?": boolean | null;
  marked_at: string | null;
  cursus_ids: number[];
  project: { id: number; name: string; slug: string; parent_id: number | null };
};

export type User = {
  id: number;
  login: string;
  email: string;
  phone: string | null;
  displayname: string;
  image: {
    link: string | null;
    versions: {
      large: string | null;
      medium: string | null;
      small: string | null;
    } | null;
  } | null;
  location: string | null;
  wallet: number;
  correction_point: number;
  pool_year: string | null;
  campus: { id: number; name: string }[];
  cursus_users: CursusUser[];
  projects_users: ProjectUser[];
};

const LOGIN_PATTERN = /^[a-z][a-z0-9_-]*$/;

/** Trims and lowercases a login, and throws if it can't be a valid 42 login. */
export function normalizeLogin(input: string) {
  const login = input.trim().toLowerCase();
  if (!login) {
    throw new ApiError("invalid-login", "Enter a login to search for.");
  }
  if (!LOGIN_PATTERN.test(login)) {
    throw new ApiError(
      "invalid-login",
      'A login starts with a letter and only contains letters, digits, "-" and "_".',
    );
  }
  return login;
}

const userCache = new Map<string, User>();

export function getCachedUser(login: string) {
  return userCache.get(login);
}

export async function fetchUser(login: string): Promise<User> {
  try {
    const user = await apiGet<User>(`/v2/users/${encodeURIComponent(login)}`);
    userCache.set(login, user);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.kind === "not-found") {
      throw new ApiError(
        "not-found",
        `No student found with the login "${login}".`,
      );
    }
    throw error;
  }
}
