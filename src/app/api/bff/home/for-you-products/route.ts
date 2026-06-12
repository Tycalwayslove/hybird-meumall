import { homeExperienceData } from "@/features/home/mock/home-page-data";
import { fetchHomeForYouProductsData } from "@/features/home/server/home-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = createBffRequestContext(request);
    const result = await fetchHomeForYouProductsData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      current: Number(url.searchParams.get("current") ?? 1),
      fallbackProducts: homeExperienceData.products,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      size: Number(url.searchParams.get("size") ?? 10)
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Home for-you products BFF request failed.",
      requestId,
      route: "/api/bff/home/for-you-products"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Home for-you products BFF request failed.",
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

function statusFromError(error: unknown) {
  const apiError = createApiError("NETWORK_ERROR", {
    message: error instanceof Error ? error.message : undefined
  });

  return apiError.recoverable ? 502 : 500;
}
