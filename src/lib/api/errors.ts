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

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(
    "unknown",
    error instanceof Error ? error.message : "Something went wrong.",
  );
}
