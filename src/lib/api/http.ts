import { ApiError } from "./errors";

const API_URL = "https://api.intra.42.fr";
const REQUEST_TIMEOUT_MS = 15_000;

export type Query = Record<string, string | number>;

/**
 * `{ a: 1, b: "x y" }` → `a=1&b=x%20y`, for URLs and form bodies. Keys are
 * encoded too, so the API's `page[size]` is sent as `page%5Bsize%5D`.
 */
export function encodeQuery(query: Query) {
  return Object.entries(query)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

/** Full URL for an API path, with its query string if any. */
export function buildUrl(path: string, query: Query = {}) {
  const params = encodeQuery(query);
  return `${API_URL}${path}${params ? `?${params}` : ""}`;
}

/** `fetch` with a timeout, turning network failures into `ApiError`s. */
export async function request(
  url: string,
  init: RequestInit,
): Promise<Response> {
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

/** Throws an `ApiError` matching the response's HTTP status, if it failed. */
export function throwForStatus({ ok, status }: Response) {
  if (ok) return;

  if (status === 404) {
    throw new ApiError("not-found", "Not found.");
  }
  if (status === 429) {
    throw new ApiError(
      "rate-limited",
      "Too many requests to the 42 API. Wait a moment and try again.",
    );
  }
  if (status >= 500) {
    throw new ApiError(
      "server",
      `The 42 API is having trouble (HTTP ${status}). Try again later.`,
    );
  }
  throw new ApiError(
    "unknown",
    `Unexpected response from the 42 API (HTTP ${status}).`,
  );
}
