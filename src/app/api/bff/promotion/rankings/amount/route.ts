import { fetchPromotionRankingData } from "@/features/promotion/server/promotion-ranking-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const context = createBffRequestContext(request);
    const result = await fetchPromotionRankingData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      period: searchParams.get("period"),
      rankingType: "amount",
      statPeriod: searchParams.get("statPeriod")
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Promotion amount ranking BFF request failed.",
      requestId,
      route: "/api/bff/promotion/rankings/amount"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Promotion amount ranking BFF request failed.",
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
