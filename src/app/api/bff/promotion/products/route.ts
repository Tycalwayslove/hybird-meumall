import { fetchPromotionProductsData } from "@/features/promotion/server/promotion-products-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = createBffRequestContext(request);
    const result = await fetchPromotionProductsData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      categoryId2: optionalNumber(url.searchParams.get("categoryId2")),
      categoryId3: optionalNumber(url.searchParams.get("categoryId3")),
      clientContext: context.clientContext,
      current: Number(url.searchParams.get("current") ?? 1),
      includeDebugRaw: shouldIncludeDebugRaw(request),
      prodName: url.searchParams.get("prodName") ?? undefined,
      size: Number(url.searchParams.get("size") ?? 10),
      sort: optionalNumber(url.searchParams.get("sort"))
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Promotion products BFF request failed.",
      requestId,
      route: "/api/bff/promotion/products"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Promotion products BFF request failed.",
        requestId,
        recoverable: true
      },
      {
        status: statusFromError(error)
      }
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

function optionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function statusFromError(error: unknown) {
  const apiError = createApiError("NETWORK_ERROR", {
    message: error instanceof Error ? error.message : undefined
  });

  return apiError.recoverable ? 502 : 500;
}
