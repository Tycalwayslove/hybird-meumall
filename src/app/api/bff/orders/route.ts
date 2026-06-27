import { fetchOrderListData, type OrderStatus } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("status") === "refund") {
    return toBffResponse({
      error: createApiError("PARSE_ERROR", {
        httpStatus: 400,
        message: "退货退款列表请使用 /api/bff/orders/refunds。"
      }),
      ok: false
    });
  }
  const context = createBffRequestContext(request);
  const result = await fetchOrderListData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    current: Number(url.searchParams.get("current") ?? 1),
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    keyword: url.searchParams.get("keyword")?.trim(),
    route: "/api/bff/orders",
    size: Number(url.searchParams.get("size") ?? 10),
    status: normalizeOrderStatus(url.searchParams.get("status"))
  });

  return toBffResponse(result);
}

function normalizeOrderStatus(value: string | null): OrderStatus {
  const known = new Set<OrderStatus>(["all", "pending-payment", "pending-shipment", "pending-receipt", "completed"]);
  return known.has(value as OrderStatus) ? (value as OrderStatus) : "all";
}
