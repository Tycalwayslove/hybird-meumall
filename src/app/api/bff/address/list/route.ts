import { fetchAddressList } from "@/features/mine-secondary/server/address-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const context = createBffRequestContext(request);
  const result = await fetchAddressList({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/address/list"
  });

  return toBffResponse(result);
}
