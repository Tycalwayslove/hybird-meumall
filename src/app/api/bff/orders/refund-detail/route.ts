import { fetchRefundDetailData } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refundSn = url.searchParams.get("refundSn")?.trim();
  if (!refundSn) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "退款编号缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await fetchRefundDetailData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    refundSn,
    route: "/api/bff/orders/refund-detail"
  });

  return toBffResponse(result);
}
