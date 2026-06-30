import { fetchSellerActivitiesData } from "@/features/seller-activity/server/seller-activity-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const context = createBffRequestContext(request);
    const result = await fetchSellerActivitiesData({
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL
    });

    return toBffResponse(result);
  } catch (error) {
    return routeErrorResponse(request, error, "/api/bff/seller-activities");
  }
}

function routeErrorResponse(request: Request, error: unknown, route: string) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  console.error("[h5-bff-route-error]", {
    message: error instanceof Error ? error.message : "Seller activities BFF request failed.",
    requestId,
    route
  });

  const apiError = createApiError("NETWORK_ERROR", {
    message: error instanceof Error ? error.message : undefined,
    requestId
  });
  return Response.json(
    {
      success: false,
      code: apiError.code,
      message: apiError.message,
      requestId,
      recoverable: apiError.recoverable
    },
    { status: 502 }
  );
}
