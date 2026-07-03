import { fetchCertificationApplyUrl } from "@/features/certification/server/certification-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get("name")?.trim();
    if (!name) {
      return Response.json(
        {
          success: false,
          code: "HTTP_ERROR",
          message: "请输入真实姓名",
          requestId: request.headers.get("x-request-id") ?? undefined,
          recoverable: true
        },
        { status: 400 }
      );
    }

    const context = createBffRequestContext(request);
    const result = await fetchCertificationApplyUrl({
      authToken: readRequestAuthToken(request) ?? context.getAuthToken("java"),
      backendClient: context.backendClient,
      name,
      route: "/register/certification/name"
    });

    return toBffResponse(result);
  } catch (error) {
    return routeErrorResponse(request, error, "/api/bff/certification/apply-url", "Certification apply URL BFF request failed.");
  }
}

function readRequestAuthToken(request: Request) {
  return request.headers.get("x-meumall-auth-token")?.trim() || null;
}

function routeErrorResponse(request: Request, error: unknown, route: string, fallbackMessage: string) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error("[h5-bff-route-error]", { message, requestId, route });

  return Response.json(
    {
      success: false,
      code: "NETWORK_ERROR",
      message,
      requestId,
      recoverable: true
    },
    {
      status: statusFromError(error)
    }
  );
}

function statusFromError(error: unknown) {
  const apiError = createApiError("NETWORK_ERROR", {
    message: error instanceof Error ? error.message : undefined
  });

  return apiError.recoverable ? 502 : 500;
}
