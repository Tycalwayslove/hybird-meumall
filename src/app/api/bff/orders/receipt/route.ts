import { receiptOrder } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function PUT(request: Request) {
  const payload = (await request.json().catch(() => null)) as { orderNumber?: string } | null;
  const orderNumber = payload?.orderNumber?.trim();
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
  const result = await receiptOrder({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    orderNumber,
    route: "/api/bff/orders/receipt"
  });

  return toBffResponse(result);
}
