import { setDefaultAddress } from "@/features/mine-secondary/server/address-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function PUT(request: Request) {
  const payload = (await request.json().catch(() => null)) as { addrId?: string } | null;
  const addrId = payload?.addrId?.trim();
  if (!addrId) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "地址 ID 缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await setDefaultAddress({
    addrId,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/address/default"
  });

  return toBffResponse(result);
}
