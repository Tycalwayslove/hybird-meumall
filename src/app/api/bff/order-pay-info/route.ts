import { fetchOrderPayInfoData } from "@/features/payment/server/cashier-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNumbers = url.searchParams.get("orderNumbers")?.trim();

    if (!orderNumbers) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "订单号缺失。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const result = await fetchOrderPayInfoData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      dvyType: url.searchParams.get("dvyType")?.trim() || "1",
      includeDebugRaw: shouldIncludeDebugRaw(request),
      isPurePoints: url.searchParams.get("isPurePoints")?.trim() || "0",
      orderNumbers,
      orderType: url.searchParams.get("orderType")?.trim() || "0",
      ordermold: url.searchParams.get("ordermold")?.trim() || "0"
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Order pay info BFF request failed.",
      requestId,
      route: "/api/bff/order-pay-info"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Order pay info BFF request failed.",
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
