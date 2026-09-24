import { ApiError } from "./errors";
import { buildUrl, type Query, request, throwForStatus } from "./http";
import { getToken, invalidateToken } from "./token";

/** The 42 API allows ~2 requests per second; wait this long before retrying. */
const RATE_LIMIT_RETRY_MS = 1_000;
const RATE_LIMIT_MAX_RETRIES = 3;

/** The largest page the 42 API allows. */
const MAX_PAGE_SIZE = 100;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** How long a 429 response asks us to wait, from its Retry-After header. */
function getRetryDelay(response: Response) {
  const seconds = Number(response.headers.get("Retry-After"));
  return seconds > 0 ? seconds * 1_000 : RATE_LIMIT_RETRY_MS;
}

/**
 * Authenticated GET on the 42 API, returning the parsed JSON body.
 *
 * - 429 (too many requests): waits and retries, up to a few times.
 * - 401 (token revoked or expired early): gets a new token and retries once.
 */
export async function apiGet<T>(path: string, query?: Query): Promise<T> {
  const url = buildUrl(path, query);
  let rateLimitRetries = RATE_LIMIT_MAX_RETRIES;
  let tokenRefreshed = false;

  while (true) {
    const { accessToken } = await getToken();
    const response = await request(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 429 && rateLimitRetries > 0) {
      rateLimitRetries--;
      await wait(getRetryDelay(response));
      continue;
    }

    if (response.status === 401) {
      if (tokenRefreshed) {
        throw new ApiError(
          "unauthorized",
          "The 42 API refused the access token.",
        );
      }
      tokenRefreshed = true;
      invalidateToken();
      continue;
    }

    throwForStatus(response);
    return response.json();
  }
}

/** Every item of a paginated endpoint, fetching one page after another. */
export async function apiGetAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const batch = await apiGet<T[]>(path, {
      "page[size]": MAX_PAGE_SIZE,
      "page[number]": page,
    });
    items.push(...batch);
    if (batch.length < MAX_PAGE_SIZE) return items;
  }
}

/**
 * Sends the current token to the API, getting a new one if it was rejected.
 * `getToken()` alone only checks the expiry date, so it can't notice a
 * revoked token.
 */
export async function checkToken() {
  await apiGet("/oauth/token/info");
}
