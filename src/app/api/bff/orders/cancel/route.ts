import { cancelOrder } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function PUT(request: Request) {
  const orderNumber = await readOrderNumber(request);
  if (!orderNumber) {
    return missingOrderNumber(request);
  }

  const context = createBffRequestContext(request);
  const result = await cancelOrder({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    orderNumber,
    route: "/api/bff/orders/cancel"
  });

  return toBffResponse(result);
}

async function readOrderNumber(request: Request) {
  const payload = (await request.json().catch(() => null)) as { orderNumber?: string } | null;
  return payload?.orderNumber?.trim();
}

function missingOrderNumber(request: Request) {
  return toBffResponse({
    ok: false,
    error: createApiError("PARSE_ERROR", {
      message: "订单号缺失。",
      requestId: request.headers.get("x-request-id") ?? undefined
    })
  });
}
