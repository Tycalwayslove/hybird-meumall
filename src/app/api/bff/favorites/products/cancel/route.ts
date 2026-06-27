import { cancelFavoriteProduct } from "@/features/mine-secondary/server/collections-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  const prodId = await readProdId(request);
  if (!prodId) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "商品 ID 缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await cancelFavoriteProduct({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    prodId,
    route: "/api/bff/favorites/products/cancel"
  });

  return toBffResponse(result);
}

async function readProdId(request: Request) {
  const payload = (await request.json().catch(() => null)) as { prodId?: string | number } | null;
  return payload?.prodId === undefined || payload.prodId === null ? "" : String(payload.prodId).trim();
}
