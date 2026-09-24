/**
 * Minimal client for the 42 API (v2), authenticated with the intra OAuth2
 * client-credentials flow.
 */

export { checkToken } from "./client";
export { ApiError, type ApiErrorKind, toApiError } from "./errors";
export {
  corruptToken,
  getCurrentToken,
  getToken,
  hasCredentials,
  subscribeToToken,
  type Token,
} from "./token";
export type {
  CursusUser,
  FtEvent,
  ProjectUser,
  Skill,
  User,
} from "./types";
export { fetchUser, getCachedUser, normalizeLogin } from "./users";
