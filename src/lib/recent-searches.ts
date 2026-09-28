import Storage from "expo-sqlite/kv-store";
import take from "lodash/take";
import uniq from "lodash/uniq";

// https://docs.expo.dev/versions/latest/sdk/sqlite/#key-value-storage
const STORAGE_KEY = "recent-searches";
export const MAX_RECENT_SEARCHES = 10;

export function addRecentSearch(recent: string[], login: string) {
  return take(uniq([login, ...recent]), MAX_RECENT_SEARCHES);
}

export function loadRecentSearches(): string[] {
  try {
    const saved: unknown = JSON.parse(Storage.getItemSync(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved)
      ? saved
          .filter((login) => typeof login === "string")
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentSearches(recent: string[]) {
  try {
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    //
  }
}
