import { fetchSellerActivityDetailData } from "@/features/seller-activity/server/seller-activity-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type RouteContext = {
  params: Promise<{
    activityId: string;
    prodId: string;
  }>;
};

export async function GET(request: Request, contextParams: RouteContext) {
  const { activityId, prodId } = await contextParams.params;
  const parsedActivityId = Number(activityId);
  const parsedProdId = Number(prodId);
  if (!Number.isFinite(parsedActivityId) || !Number.isFinite(parsedProdId)) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "活动或商品 ID 缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  try {
    const context = createBffRequestContext(request);
    const result = await fetchSellerActivityDetailData({
      activityId: parsedActivityId,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
      prodId: parsedProdId
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      activityId,
      message: error instanceof Error ? error.message : "Seller activity detail BFF request failed.",
      prodId,
      requestId,
      route: "/api/bff/seller-activities/[activityId]/products/[prodId]"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Seller activity detail BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}
