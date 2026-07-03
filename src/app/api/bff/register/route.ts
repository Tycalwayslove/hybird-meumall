import { submitRegister } from "@/features/register/server/register-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{ data: string }>;
    if (!body.data) {
      return Response.json(
        {
          success: false,
          code: "HTTP_ERROR",
          message: "注册参数缺失",
          requestId: request.headers.get("x-request-id") ?? undefined,
          recoverable: true
        },
        { status: 400 }
      );
    }

    const context = createBffRequestContext(request);
    const result = await submitRegister({
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      payload: { data: body.data }
    });

    return toBffResponse(result);
  } catch (error) {
    return routeErrorResponse(request, error, "/api/bff/register", "Register BFF request failed.");
  }
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
