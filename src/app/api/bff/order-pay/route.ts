import { createOrderPaymentData } from "@/features/payment/server/cashier-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const orderNumbers = normalizeText(payload.orderNumbers);
    const payType = normalizePayType(payload.payType);

    if (!orderNumbers || payType === undefined) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "支付参数缺失。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const requestId = request.headers.get("x-request-id") ?? undefined;
    const requestPayload = {
      dvyType: normalizeText(payload.dvyType) || "1",
      isPurePoints: payload.isPurePoints === true || payload.isPurePoints === "1",
      orderNumbers,
      orderType: normalizeText(payload.orderType) || "0",
      ordermold: normalizeText(payload.ordermold) || "0",
      payType,
      returnUrl: createPaymentReturnUrl(request, orderNumbers)
    };
    console.info("[h5-order-pay-bff-request]", JSON.stringify({ payload: requestPayload, requestId }, null, 2));

    const result = await createOrderPaymentData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      dvyType: requestPayload.dvyType,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      isPurePoints: requestPayload.isPurePoints,
      orderNumbers,
      orderType: requestPayload.orderType,
      ordermold: requestPayload.ordermold,
      payType,
      returnUrl: requestPayload.returnUrl
    });
    console.info(
      "[h5-order-pay-bff-response]",
      JSON.stringify(
        {
          ok: result.ok,
          ...(result.ok ? { data: result.data, requestId: result.meta.requestId } : { error: result.error, requestId: result.error.requestId })
        },
        null,
        2
      )
    );

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Order pay BFF request failed.",
      requestId,
      route: "/api/bff/order-pay"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Order pay BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}

function normalizePayType(value: unknown): 7 | 8 | 0 | undefined {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return parsed === 7 || parsed === 8 || parsed === 0 ? parsed : undefined;
}

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function createPaymentReturnUrl(request: Request, orderNumbers: string) {
  const url = new URL(request.url);
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_H5_BASE_PATH ?? process.env.H5_BASE_PATH ?? "");
  const query = new URLSearchParams({
    orderNumbers,
    sts: "pending"
  });
  return `${url.origin}${basePath}/pay-result?${query.toString()}`;
}

function normalizeBasePath(value: string) {
  if (!value || value === "/") {
    return "";
  }
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function shouldIncludeDebugRaw(request: Request) {
  if (new URL(request.url).searchParams.get("debugRaw") !== "1") {
    return false;
  }

  const appEnv = process.env.APP_ENV;
  return appEnv === "local" || appEnv === "test";
}
