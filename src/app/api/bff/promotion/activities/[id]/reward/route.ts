import { fetchPromotionIncentiveRewardDetailData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type PromotionIncentiveRewardRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, contextParams: PromotionIncentiveRewardRouteContext) {
  const { id } = await contextParams.params;

  try {
    const context = createBffRequestContext(request);
    const result = await fetchPromotionIncentiveRewardDetailData({
      activityId: id,
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      includeDebugRaw: shouldIncludeDebugRaw(request)
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      activityId: id,
      message: error instanceof Error ? error.message : "Promotion incentive reward detail BFF request failed.",
      requestId,
      route: "/api/bff/promotion/activities/[id]/reward"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Promotion incentive reward detail BFF request failed.",
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
