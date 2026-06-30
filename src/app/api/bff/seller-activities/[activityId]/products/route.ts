import { fetchSellerActivityProductsData } from "@/features/seller-activity/server/seller-activity-service";
import type { SellerActivityStatus } from "@/features/seller-activity/types";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type RouteContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(request: Request, contextParams: RouteContext) {
  const { activityId } = await contextParams.params;
  const parsedActivityId = Number(activityId);
  if (!Number.isFinite(parsedActivityId)) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "活动 ID 缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  try {
    const url = new URL(request.url);
    const context = createBffRequestContext(request);
    const result = await fetchSellerActivityProductsData({
      activityId: parsedActivityId,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      current: Number(url.searchParams.get("current") ?? 1),
      javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
      size: Number(url.searchParams.get("size") ?? 10),
      status: normalizeStatus(url.searchParams.get("status"))
    });

    return toBffResponse(result);
  } catch (error) {
    return routeErrorResponse(request, error, "/api/bff/seller-activities/[activityId]/products");
  }
}

function normalizeStatus(value: string | null): SellerActivityStatus {
  return value === "0" ? 0 : 1;
}

function routeErrorResponse(request: Request, error: unknown, route: string) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  console.error("[h5-bff-route-error]", {
    message: error instanceof Error ? error.message : "Seller activity products BFF request failed.",
    requestId,
    route
  });

  return Response.json(
    {
      success: false,
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Seller activity products BFF request failed.",
      requestId,
      recoverable: true
    },
    { status: 502 }
  );
}
