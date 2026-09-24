export type ApiErrorKind =
  | "invalid-login"
  | "config"
  | "network"
  | "timeout"
  | "not-found"
  | "unauthorized"
  | "rate-limited"
  | "server"
  | "unknown";

/** Every error the API layer throws, so screens can show a matching message. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

/** Wraps anything thrown into an `ApiError`, to display it uniformly. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(
    "unknown",
    error instanceof Error ? error.message : "Something went wrong.",
  );
}
