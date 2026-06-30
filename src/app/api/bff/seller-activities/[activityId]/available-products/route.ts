import { fetchSellerAvailableProductsData } from "@/features/seller-activity/server/seller-activity-service";
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
    const result = await fetchSellerAvailableProductsData({
      activityId: parsedActivityId,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      categoryId: optionalNumber(url.searchParams.get("categoryId")),
      clientContext: context.clientContext,
      current: Number(url.searchParams.get("current") ?? 1),
      javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
      keyword: url.searchParams.get("keyword") ?? undefined,
      orderBy: url.searchParams.get("orderBy") ?? undefined,
      size: Number(url.searchParams.get("size") ?? 10)
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      activityId,
      message: error instanceof Error ? error.message : "Seller available products BFF request failed.",
      requestId,
      route: "/api/bff/seller-activities/[activityId]/available-products"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Seller available products BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}

function optionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
