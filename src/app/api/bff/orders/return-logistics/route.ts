import { submitReturnLogistics } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    expressId?: string | number;
    expressName?: string;
    expressNo?: string;
    imgs?: string;
    isModify?: boolean;
    mobile?: string;
    refundSn?: string;
    senderRemarks?: string;
  } | null;
  if (!payload?.expressId || !payload.expressName || !payload.expressNo || !payload.refundSn) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "退货物流参数缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await submitReturnLogistics({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    input: {
      expressId: payload.expressId,
      expressName: payload.expressName,
      expressNo: payload.expressNo,
      imgs: payload.imgs,
      mobile: payload.mobile,
      refundSn: payload.refundSn,
      senderRemarks: payload.senderRemarks
    },
    isModify: payload.isModify === true,
    route: "/api/bff/orders/return-logistics"
  });

  return toBffResponse(result);
}
