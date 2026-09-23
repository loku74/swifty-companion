import { ApiError } from "./errors";

export const API_URL = "https://api.intra.42.fr";
const REQUEST_TIMEOUT_MS = 15_000;

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
export async function throwForStatus(response: Response) {
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
