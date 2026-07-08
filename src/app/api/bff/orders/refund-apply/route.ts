import { applyRefund } from "@/features/mine-secondary/server/orders-real-service";
import type { RefundContextInput } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<RefundContextInput> | null;
  if (!payload?.orderNumber || !payload.buyerDesc || !payload.refundType || !payload.applyType) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "退款申请参数缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = applyRefund({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    input: payload as RefundContextInput,
    route: "/api/bff/orders/refund-apply"
  });

  return toBffResponse(await result);
}
