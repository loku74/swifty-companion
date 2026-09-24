import Storage from "expo-sqlite/kv-store";
import {
  addRecentSearch,
  loadRecentSearches,
  MAX_RECENT_SEARCHES,
  saveRecentSearches,
} from "@/lib/recent-searches";

jest.mock("expo-sqlite/kv-store", () => {
  const items = new Map<string, string>();
  return {
    getItemSync: jest.fn((key: string) => items.get(key) ?? null),
    setItemSync: jest.fn((key: string, value: string) => items.set(key, value)),
  };
});

describe("addRecentSearch", () => {
  it("puts the login first without duplicates", () => {
    expect(addRecentSearch(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });

  it(`keeps at most ${MAX_RECENT_SEARCHES} logins`, () => {
    const recent = Array.from(
      { length: MAX_RECENT_SEARCHES },
      (_, i) => `u${i}`,
    );
    expect(addRecentSearch(recent, "new")).toEqual([
      "new",
      ...recent.slice(0, -1),
    ]);
  });
});

describe("recent searches storage", () => {
  it("round-trips the saved list", () => {
    saveRecentSearches(["norminet", "abc"]);
    expect(loadRecentSearches()).toEqual(["norminet", "abc"]);
  });

  it("ignores corrupted data", () => {
    Storage.setItemSync("recent-searches", "{not json");
    expect(loadRecentSearches()).toEqual([]);
    Storage.setItemSync("recent-searches", JSON.stringify(["ok", 42, null]));
    expect(loadRecentSearches()).toEqual(["ok"]);
  });

  it("survives a storage failure", () => {
    jest.mocked(Storage.getItemSync).mockImplementationOnce(() => {
      throw new Error("disk error");
    });
    expect(loadRecentSearches()).toEqual([]);
  });
});
