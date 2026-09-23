/**
 * OAuth2 access token for the 42 API (intra client-credentials flow).
 *
 * A single token is cached and shared by every request. It is only re-created
 * when it is about to expire, or when the API rejects it (see `client.ts`).
 */

import { ApiError } from "./errors";
import { API_URL, request, throwForStatus } from "./http";

const CLIENT_ID = process.env.EXPO_PUBLIC_FT_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FT_CLIENT_SECRET;

/** Refresh the token slightly before it actually expires. */
const EXPIRY_MARGIN_MS = 30_000;

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
