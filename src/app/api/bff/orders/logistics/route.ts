import { fetchLogisticsData } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber")?.trim();
  if (!orderNumber) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "订单号缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await fetchLogisticsData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    deliveryId: url.searchParams.get("deliveryId")?.trim() || undefined,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    orderNumber,
    route: "/api/bff/orders/logistics"
  });

  return toBffResponse(result);
}
