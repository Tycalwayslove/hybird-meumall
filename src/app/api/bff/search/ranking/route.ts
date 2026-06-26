import { fetchSearchRankingData } from "@/features/search/server/search-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = createBffRequestContext(request);
    const result = await fetchSearchRankingData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      categoryBoardCount: normalizeOptionalPositiveNumber(url.searchParams.get("categoryBoardCount")),
      categoryId: normalizeOptionalParam(url.searchParams.get("categoryId")),
      clientContext: context.clientContext,
      includeDebugRaw: shouldIncludeDebugRaw(request),
      javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
      rankType: normalizeRankType(url.searchParams.get("rankType"))
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Search ranking BFF request failed.",
      requestId,
      route: "/api/bff/search/ranking"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Search ranking BFF request failed.",
        requestId,
        recoverable: true
      },
      {
        status: statusFromError(error)
      }
    );
  }
}

function normalizeOptionalParam(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function normalizeOptionalPositiveNumber(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeRankType(value: string | null): 1 | 2 | undefined {
  if (value === "1" || value === "2") {
    return Number(value) as 1 | 2;
  }
  return undefined;
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
