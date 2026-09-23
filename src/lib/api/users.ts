import orderBy from "lodash/orderBy";

import { apiGet } from "./client";
import { ApiError } from "./errors";
import type { FtEvent, User } from "./types";

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

/** Fetches a user's profile and their events, in parallel. */
export async function fetchUser(login: string): Promise<User> {
  try {
    const [user, events] = await Promise.all([
      apiGet<Omit<User, "events">>(`/v2/users/${encodeURIComponent(login)}`),
      fetchUserEvents(login),
    ]);
    const fullUser = { ...user, events };
    userCache.set(login, fullUser);
    return fullUser;
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

/** The largest page the 42 API allows. */
const MAX_PAGE_SIZE = 100;

/** Events the user subscribed to, most recent first. */
async function fetchUserEvents(login: string): Promise<FtEvent[]> {
  const events: FtEvent[] = [];
  for (let page = 1; ; page++) {
    // `page[size]` and `page[number]`, with the brackets percent-encoded.
    const batch = await apiGet<FtEvent[]>(
      `/v2/users/${encodeURIComponent(login)}/events?page%5Bsize%5D=${MAX_PAGE_SIZE}&page%5Bnumber%5D=${page}`,
    );
    events.push(...batch);
    if (batch.length < MAX_PAGE_SIZE) break;
  }
  return orderBy(events, "begin_at", "desc");
}
