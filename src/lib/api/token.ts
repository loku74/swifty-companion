/**
 * OAuth2 access token for the 42 API (intra client-credentials flow).
 *
 * A single token is cached and shared by every request. It is only re-created
 * when it has expired, or when the API rejects it (see `client.ts`).
 */

import { ApiError } from "./errors";
import { buildUrl, encodeQuery, request, throwForStatus } from "./http";

const CLIENT_ID = process.env.EXPO_PUBLIC_FT_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FT_CLIENT_SECRET;

export type Token = {
  accessToken: string;
  createdAt: number;
  fetchedAt: number;
  expiresAt: number;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  created_at: number;
};

let token: Token | null = null;
let pendingToken: Promise<Token> | null = null;
const listeners = new Set<() => void>();

function setToken(next: Token | null) {
  token = next;
  for (const listener of listeners) listener();
}

export function subscribeToToken(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCurrentToken() {
  return token;
}

function isFresh(candidate: Token | null): candidate is Token {
  return candidate !== null && Date.now() < candidate.expiresAt;
}

export function hasCredentials() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

function getCredentials() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new ApiError(
      "config",
      "Missing 42 API credentials. Copy .env.example to .env, fill in your app UID and secret, then restart the dev server.",
    );
  }
  return { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
}

function toToken(body: TokenResponse, now = Date.now()): Token {
  return {
    accessToken: body.access_token,
    createdAt: body.created_at * 1_000,
    fetchedAt: now,
    expiresAt: now + body.expires_in * 1_000,
  };
}

async function requestToken(): Promise<Token> {
  const { clientId, clientSecret } = getCredentials();

  const response = await request(buildUrl("/oauth/token"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeQuery({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (response.status === 400 || response.status === 401) {
    throw new ApiError(
      "unauthorized",
      "The 42 API rejected the app credentials. Check .env — the secret may have expired and need to be regenerated on the intra.",
    );
  }
  throwForStatus(response);

  return toToken(await response.json());
}

export async function getToken(): Promise<Token> {
  if (isFresh(token)) return token;

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

export function invalidateToken() {
  setToken(null);
}

// Debug helpers, used by the Session tab to demonstrate token renewal
// |   |   |
// v   v   v

function patchToken(patch: Partial<Token>) {
  if (token) setToken({ ...token, ...patch });
}

const REVOKED_TOKEN = "revoked-token";

export function corruptToken() {
  patchToken({ accessToken: REVOKED_TOKEN });
}

export function isTokenFresh(candidate: Token | null) {
  return isFresh(candidate) && candidate.accessToken !== REVOKED_TOKEN;
}
