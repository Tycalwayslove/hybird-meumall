import { saveAddress, type JavaAddress } from "@/features/mine-secondary/server/address-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function POST(request: Request) {
  return handleSave(request);
}

export async function PUT(request: Request) {
  return handleSave(request);
}

async function handleSave(request: Request) {
  const payload = (await request.json().catch(() => null)) as JavaAddress | null;
  if (!payload || !payload.receiver || !payload.mobile || !payload.province || !payload.city || !payload.area || !payload.addr) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "收货地址信息不完整。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await saveAddress({
    address: payload,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/address/save"
  });

  return toBffResponse(result);
}
