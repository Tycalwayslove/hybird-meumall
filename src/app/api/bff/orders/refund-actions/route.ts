import { cancelPlatformIntervention, cancelRefundApplication, updateRefundAmount } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function PUT(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    action?: "cancel-platform" | "cancel-refund" | "modify-amount";
    orderNumber?: string;
    refundAmount?: number | string;
    refundId?: string;
    refundSn?: string;
  } | null;
  const action = payload?.action;
  const refundSn = payload?.refundSn?.trim();
  if (!action || !refundSn) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "售后操作参数缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const common = {
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/orders/refund-actions"
  };

  if (action === "cancel-refund") {
    return toBffResponse(await cancelRefundApplication({ ...common, refundSn }));
  }
  if (action === "modify-amount" && payload.refundAmount) {
    return toBffResponse(await updateRefundAmount({ ...common, refundAmount: payload.refundAmount, refundSn }));
  }
  if (action === "cancel-platform" && payload.refundId && payload.orderNumber) {
    return toBffResponse(await cancelPlatformIntervention({ ...common, orderNumber: payload.orderNumber, refundId: payload.refundId, refundSn }));
  }

  return toBffResponse({
    ok: false,
    error: createApiError("PARSE_ERROR", {
      message: "售后操作参数不完整。",
      requestId: request.headers.get("x-request-id") ?? undefined
    })
  });
}
