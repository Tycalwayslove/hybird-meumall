import { batchUpdateSellerActivityStatus, type SellerActivityBatchStatusInput } from "@/features/seller-activity/server/seller-activity-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<SellerActivityBatchStatusInput>;
    if (!Array.isArray(body.ids) || body.ids.length === 0 || ![-1, 0, 1].includes(Number(body.status))) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "批量操作参数不完整。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const result = await batchUpdateSellerActivityStatus({
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      body: {
        ids: body.ids.map(Number),
        status: Number(body.status) as -1 | 0 | 1
      },
      clientContext: context.clientContext
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Seller activity batch status BFF request failed.",
      requestId,
      route: "/api/bff/seller-activities/batch-status"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Seller activity batch status BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}
