import { fetchAddressRegions } from "@/features/mine-secondary/server/address-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parentId = url.searchParams.get("parentId")?.trim() || null;
  const context = createBffRequestContext(request);
  const result = await fetchAddressRegions({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    parentId,
    route: "/api/bff/address/regions"
  });

  return toBffResponse(result);
}
