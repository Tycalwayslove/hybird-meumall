import { submitPlatformIntervention } from "@/features/mine-secondary/server/orders-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    imgUrls?: string;
    orderNumber?: string;
    pageType?: 1 | 2;
    refundId?: string;
    refundSts?: number | string;
    voucherDesc?: string;
  } | null;
  if (!payload?.refundId || !payload.orderNumber || !payload.voucherDesc || !payload.imgUrls) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "平台介入参数缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await submitPlatformIntervention({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    input: {
      imgUrls: payload.imgUrls,
      orderNumber: payload.orderNumber,
      refundId: payload.refundId,
      refundSts: payload.refundSts,
      voucherDesc: payload.voucherDesc
    },
    pageType: payload.pageType === 2 ? 2 : 1,
    route: "/api/bff/orders/platform-intervention"
  });

  return toBffResponse(result);
}
