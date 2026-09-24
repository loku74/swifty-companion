/** Synchronous key-value storage, backed by `localStorage` on web. */
export const storage = {
  getItem: (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key: string, value: string) =>
    globalThis.localStorage?.setItem(key, value),
};
