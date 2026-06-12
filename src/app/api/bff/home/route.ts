import { homeExperienceData } from "@/features/home/mock/home-page-data";
import { fetchHomeExperienceData } from "@/features/home/server/home-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const context = createBffRequestContext(request);
    const result = await fetchHomeExperienceData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      fallback: homeExperienceData,
      includeDebugRaw: shouldIncludeDebugRaw(request)
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Home BFF request failed.",
      requestId,
      route: "/api/bff/home"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Home BFF request failed.",
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
