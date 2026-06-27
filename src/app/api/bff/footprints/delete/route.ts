import { deleteFootprints } from "@/features/mine-secondary/server/collections-real-service";
import { createApiError } from "@/lib/api/errors";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function DELETE(request: Request) {
  const ids = await readIds(request);
  if (ids.length === 0) {
    return toBffResponse({
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "足迹 ID 缺失。",
        requestId: request.headers.get("x-request-id") ?? undefined
      })
    });
  }

  const context = createBffRequestContext(request);
  const result = await deleteFootprints({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    ids,
    route: "/api/bff/footprints/delete"
  });

  return toBffResponse(result);
}

async function readIds(request: Request) {
  const payload = (await request.json().catch(() => null)) as { ids?: Array<number | string> } | null;
  return Array.isArray(payload?.ids) ? payload.ids.map((id) => String(id).trim()).filter(Boolean) : [];
}
