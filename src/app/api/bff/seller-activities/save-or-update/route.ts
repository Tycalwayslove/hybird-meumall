import { saveSellerActivity, type SellerActivitySaveInput } from "@/features/seller-activity/server/seller-activity-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<SellerActivitySaveInput>;
    if (!isValidSaveInput(body)) {
      return toBffResponse({
        ok: false,
        error: createApiError("PARSE_ERROR", {
          message: "活动商品保存参数不完整。",
          requestId: request.headers.get("x-request-id") ?? undefined
        })
      });
    }

    const context = createBffRequestContext(request);
    const result = await saveSellerActivity({
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      body,
      clientContext: context.clientContext
    });

    return toBffResponse(result);
  } catch (error) {
    const requestId = request.headers.get("x-request-id") ?? undefined;
    console.error("[h5-bff-route-error]", {
      message: error instanceof Error ? error.message : "Seller activity save BFF request failed.",
      requestId,
      route: "/api/bff/seller-activities/save-or-update"
    });

    return Response.json(
      {
        success: false,
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Seller activity save BFF request failed.",
        requestId,
        recoverable: true
      },
      { status: 502 }
    );
  }
}

function isValidSaveInput(body: Partial<SellerActivitySaveInput>): body is SellerActivitySaveInput {
  return (
    typeof body.activityId === "number" &&
    typeof body.prodId === "number" &&
    typeof body.limitNum === "number" &&
    Array.isArray(body.skuList) &&
    body.skuList.length > 0 &&
    body.skuList.every((sku) => typeof sku.skuId === "number" && typeof sku.activityPrice === "number")
  );
}
