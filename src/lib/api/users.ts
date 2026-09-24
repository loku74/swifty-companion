import orderBy from "lodash/orderBy";

import { apiGet, apiGetAll } from "./client";
import { ApiError } from "./errors";
import type { ApiUser, FtEvent, User } from "./types";

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

function userPath(login: string) {
  return `/v2/users/${encodeURIComponent(login)}`;
}

/** Fetches a user's profile and their events, in parallel, and caches them. */
export async function fetchUser(login: string): Promise<User> {
  try {
    const [profile, events] = await Promise.all([
      apiGet<ApiUser>(userPath(login)),
      apiGetAll<FtEvent>(`${userPath(login)}/events`),
    ]);
    const user: User = {
      ...profile,
      events: orderBy(events, "begin_at", "desc"),
    };
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
