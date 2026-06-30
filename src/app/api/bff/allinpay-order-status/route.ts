import { fetchAllinpayOrderStatusData } from "@/features/payment/server/cashier-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bizOrderNo = url.searchParams.get("bizOrderNo")?.trim();

    if (!bizOrderNo) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "通联业务订单号缺失。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const result = await fetchAllinpayOrderStatusData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      bizOrderNo,
      clientContext: context.clientContext,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      orderNumbers: url.searchParams.get("orderNumbers")?.trim() || undefined
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Allinpay order status BFF request failed.",
      requestId,
      route: "/api/bff/allinpay-order-status"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Allinpay order status BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}

function shouldIncludeDebugRaw(request: Request) {
  if (new URL(request.url).searchParams.get("debugRaw") !== "1") {
    return false;
  }

  const appEnv = process.env.APP_ENV;
  return appEnv === "local" || appEnv === "test";
}
