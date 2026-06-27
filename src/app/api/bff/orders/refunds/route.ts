import { fetchRefundOrderListData } from "@/features/mine-secondary/server/orders-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = createBffRequestContext(request);
  const result = await fetchRefundOrderListData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    current: Number(url.searchParams.get("current") ?? 1),
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    route: "/api/bff/orders/refunds",
    size: Number(url.searchParams.get("size") ?? 10)
  });

  return toBffResponse(result);
}
