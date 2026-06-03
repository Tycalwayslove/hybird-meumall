import type { ApiError } from "@/lib/api/types";
import type { BackendApiResult } from "./backend-client";

export function toBffResponse<T>(result: BackendApiResult<T>): Response {
  if (result.ok) {
    return Response.json({
      success: true,
      data: result.data,
      requestId: result.meta.requestId
    });
  }

  return Response.json(
    {
      success: false,
      code: result.error.code,
      message: result.error.message,
      ...(result.error.requestId === undefined ? {} : { requestId: result.error.requestId }),
      recoverable: result.error.recoverable
    },
    {
      status: statusFromError(result.error)
    }
  );
}

function statusFromError(error: ApiError) {
  if (error.code === "TOKEN_MISSING" || error.code === "AUTH_FAILED") {
    return 401;
  }
  if (error.code === "TIMEOUT") {
    return 504;
  }
  if (error.code === "NETWORK_ERROR" || error.code === "PARSE_ERROR") {
    return 502;
  }
  return error.httpStatus && error.httpStatus >= 400 ? error.httpStatus : 500;
}
