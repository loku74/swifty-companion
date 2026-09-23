import { ApiError } from "./errors";
import { API_URL, request, throwForStatus } from "./http";
import { getToken, invalidateToken } from "./token";

/** The 42 API allows ~2 requests per second; wait this long before retrying. */
const RATE_LIMIT_RETRY_MS = 1_000;
const RATE_LIMIT_MAX_RETRIES = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Authenticated GET on the 42 API, returning the parsed JSON body. */
export async function apiGet<T>(
  path: string,
  canRetry = true,
  rateLimitRetries = RATE_LIMIT_MAX_RETRIES,
): Promise<T> {
  const { accessToken } = await getToken();
  const response = await request(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Too many requests at once (a search fetches several endpoints): wait,
  // honoring the API's Retry-After header when present, then try again.
  if (response.status === 429 && rateLimitRetries > 0) {
    const retryAfterSeconds = Number(response.headers.get("Retry-After"));
    await wait(
      retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : RATE_LIMIT_RETRY_MS,
    );
    return apiGet<T>(path, canRetry, rateLimitRetries - 1);
  }

  // The token was revoked or expired early: get a new one and retry once.
  if (response.status === 401 && canRetry) {
    invalidateToken();
    return apiGet<T>(path, false, rateLimitRetries);
  }
  if (response.status === 401) {
    throw new ApiError("unauthorized", "The 42 API refused the access token.");
  }
  await throwForStatus(response);

  return response.json();
}
