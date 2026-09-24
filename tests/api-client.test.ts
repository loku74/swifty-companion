import type { apiGet as ApiGet } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

function json(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

const tokenResponse = (accessToken: string) =>
  json(200, { access_token: accessToken, expires_in: 7200 });

let apiGet: typeof ApiGet;
const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();

beforeEach(() => {
  process.env.EXPO_PUBLIC_FT_CLIENT_ID = "id";
  process.env.EXPO_PUBLIC_FT_CLIENT_SECRET = "secret";
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  // Fresh module state (cached token) for every test.
  jest.isolateModules(() => {
    apiGet = require("@/lib/api/client").apiGet;
  });
});

function authorizationOf(call: number) {
  const headers = fetchMock.mock.calls[call][1].headers as Record<
    string,
    string
  >;
  return headers.Authorization;
}

it("reuses one token across requests", async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse("t1"))
    .mockResolvedValueOnce(json(200, { id: 1 }))
    .mockResolvedValueOnce(json(200, { id: 2 }));

  await expect(apiGet("/a")).resolves.toEqual({ id: 1 });
  await expect(apiGet("/b")).resolves.toEqual({ id: 2 });

  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(authorizationOf(2)).toBe("Bearer t1");
});

it("gets a new token and retries once on 401", async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse("revoked"))
    .mockResolvedValueOnce(json(401, {}))
    .mockResolvedValueOnce(tokenResponse("fresh"))
    .mockResolvedValueOnce(json(200, { ok: true }));

  await expect(apiGet("/me")).resolves.toEqual({ ok: true });
  expect(authorizationOf(3)).toBe("Bearer fresh");
});

it("gives up after a second 401", async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse("t1"))
    .mockResolvedValueOnce(json(401, {}))
    .mockResolvedValueOnce(tokenResponse("t2"))
    .mockResolvedValueOnce(json(401, {}));

  await expect(apiGet("/me")).rejects.toMatchObject<Partial<ApiError>>({
    kind: "unauthorized",
  });
});

it("waits and retries when rate limited", async () => {
  jest.useFakeTimers();
  fetchMock
    .mockResolvedValueOnce(tokenResponse("t1"))
    .mockResolvedValueOnce(json(429, {}, { "Retry-After": "2" }))
    .mockResolvedValueOnce(json(200, { ok: true }));

  const result = apiGet("/me");
  await jest.advanceTimersByTimeAsync(2000);
  await expect(result).resolves.toEqual({ ok: true });
  jest.useRealTimers();
});

it("maps a 404 to a not-found error", async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse("t1"))
    .mockResolvedValueOnce(json(404, {}));

  await expect(apiGet("/users/nobody")).rejects.toMatchObject<
    Partial<ApiError>
  >({ kind: "not-found" });
});
