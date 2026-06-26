import { submitProductOrder } from "@/features/product/server/product-real-service";
import type { OrderFlowLogParam } from "@/features/product/order-flow-log";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  try {
    const payload = await readJsonBody(request);
    const addrId = normalizeBodyString(payload.addrId) || "0";
    const orderFlowLogParam = normalizeOrderFlowLogParam(payload.orderFlowLogParam);
    const productId = normalizeBodyString(payload.productId);
    const skuId = normalizeBodyString(payload.skuId);
    const quantity = Number(payload.quantity ?? 1);

    if (!productId || !skuId) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "商品或规格参数缺失。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const result = await submitProductOrder({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      addrId,
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      orderFlowLogParam,
      productId,
      quantity,
      skuId
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Order submit BFF request failed.",
      requestId,
      route: "/api/bff/order-submit"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Order submit BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => undefined);
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function normalizeBodyString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function normalizeOrderFlowLogParam(value: unknown): OrderFlowLogParam | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as OrderFlowLogParam;
}

function shouldIncludeDebugRaw(request: Request) {
  if (new URL(request.url).searchParams.get("debugRaw") !== "1") {
    return false;
  }

  const appEnv = process.env.APP_ENV;
  return appEnv === "local" || appEnv === "test";
}
