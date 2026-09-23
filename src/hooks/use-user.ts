import { useCallback, useEffect, useState } from "react";

import {
  type ApiError,
  fetchUser,
  getCachedUser,
  toApiError,
  type User,
} from "@/lib/api";

type UserState =
  | { status: "loading"; user?: undefined; error?: undefined }
  | { status: "success"; user: User; error?: undefined }
  | { status: "error"; user?: undefined; error: ApiError };

/**
 * Loads a 42 user. Uses the copy cached by the search screen when available,
 * so opening a profile doesn't hit the API twice.
 */
export function useUser(login: string) {
  const [state, setState] = useState<UserState>(() => {
    const cached = getCachedUser(login);
    return cached ? { status: "success", user: cached } : { status: "loading" };
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (getCachedUser(login)) return;

    // The initial state is already 'loading': a profile screen's login never changes.
    let cancelled = false;
    fetchUser(login).then(
      (user) => !cancelled && setState({ status: "success", user }),
      (error) =>
        !cancelled && setState({ status: "error", error: toApiError(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [login]);

  /** Re-fetches the user. Keeps showing the current data while loading. */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setState({ status: "success", user: await fetchUser(login) });
    } catch (error) {
      setState({ status: "error", error: toApiError(error) });
    } finally {
      setRefreshing(false);
    }
  }, [login]);

  return { ...state, refreshing, refresh };
}
