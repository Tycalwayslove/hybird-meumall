import { deleteOrder } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function DELETE(request: Request) {
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
  const result = await deleteOrder({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    orderNumber,
    route: "/api/bff/orders/delete"
  });

  return toBffResponse(result);
}
