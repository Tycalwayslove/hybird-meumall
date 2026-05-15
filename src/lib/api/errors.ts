import type { ApiError, ApiErrorCode } from "./types";

const defaultMessages: Record<ApiErrorCode, string> = {
  TOKEN_MISSING: "Auth token is unavailable.",
  AUTH_FAILED: "Authentication failed.",
  NETWORK_ERROR: "Network request failed.",
  TIMEOUT: "API request timed out.",
  HTTP_ERROR: "API request failed.",
  PARSE_ERROR: "API response could not be parsed."
};

const defaultRecoverable: Record<ApiErrorCode, boolean> = {
  TOKEN_MISSING: true,
  AUTH_FAILED: true,
  NETWORK_ERROR: true,
  TIMEOUT: true,
  HTTP_ERROR: true,
  PARSE_ERROR: false
};

export function createApiError(
  code: ApiErrorCode,
  options: {
    details?: Record<string, unknown>;
    httpStatus?: number;
    message?: string;
    recoverable?: boolean;
    requestId?: string;
  } = {}
): ApiError {
  return {
    code,
    message: options.message ?? defaultMessages[code],
    ...(options.httpStatus === undefined ? {} : { httpStatus: options.httpStatus }),
    ...(options.requestId === undefined ? {} : { requestId: options.requestId }),
    recoverable: options.recoverable ?? defaultRecoverable[code],
    ...(options.details === undefined ? {} : { details: options.details })
  };
}
