import { receivePromotionIncentiveReward } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type PromotionIncentiveReceiveRouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function PATCH(request: Request, contextParams: PromotionIncentiveReceiveRouteContext) {
  const { recordId } = await contextParams.params;

  try {
    const body = await readJsonBody(request);
    const context = createBffRequestContext(request);
    const result = await receivePromotionIncentiveReward({
      addressId: optionalNumber(body.addressId),
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      recordId
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Promotion incentive reward receive BFF request failed.",
      recordId,
      requestId,
      route: "/api/bff/promotion/activities/rewards/[recordId]/receive"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Promotion incentive reward receive BFF request failed.",
        requestId,
        recoverable: true
      },
      {
        status: statusFromError(error)
      }
    );
  }
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
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
