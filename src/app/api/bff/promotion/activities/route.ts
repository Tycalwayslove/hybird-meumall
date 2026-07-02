import { fetchPromotionIncentiveActivitiesData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const context = createBffRequestContext(request);
    const result = await fetchPromotionIncentiveActivitiesData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      current: Number(searchParams.get("current") ?? 1),
      displayStates: getNumericArrayParam(searchParams, "displayStates"),
      includeDebugRaw: shouldIncludeDebugRaw(request),
      orderBy: searchParams.get("orderBy") ?? "-createTime",
      size: Number(searchParams.get("size") ?? 10)
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Promotion incentive activities BFF request failed.",
      requestId,
      route: "/api/bff/promotion/activities"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Promotion incentive activities BFF request failed.",
        requestId,
        recoverable: true
      },
      {
        status: statusFromError(error)
      }
    );
  }
}

function getNumericArrayParam(searchParams: URLSearchParams, key: string) {
  return searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
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
