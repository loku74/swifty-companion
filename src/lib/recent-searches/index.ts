import take from "lodash/take";
import uniq from "lodash/uniq";

import { storage } from "./storage";

const STORAGE_KEY = "recent-searches";
export const MAX_RECENT_SEARCHES = 5;

/** Puts `login` first, without duplicates, keeping at most `MAX_RECENT_SEARCHES`. */
export function addRecentSearch(recent: string[], login: string) {
  return take(uniq([login, ...recent]), MAX_RECENT_SEARCHES);
}

/** Recent searches saved on this device, most recent first. */
export function loadRecentSearches(): string[] {
  try {
    const saved: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved)
      ? saved
          .filter((login) => typeof login === "string")
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    // Unreadable or corrupted storage: start with an empty history.
    return [];
  }
}

export function saveRecentSearches(recent: string[]) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // Losing the history isn't worth interrupting a search for.
  }
}
