export const apiRuntimeBoundary = {
  name: "API",
  status: "client foundation"
} as const;

export { createApiClient } from "./client";
export { createApiError } from "./errors";
export type {
  ApiAuthMode,
  ApiClient,
  ApiClientConfig,
  ApiError,
  ApiErrorCode,
  ApiFetch,
  ApiRequestOptions,
  ApiResult,
  ApiTokenProvider,
  RequestMeta
} from "./types";
