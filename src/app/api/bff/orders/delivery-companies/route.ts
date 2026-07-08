import { fetchDeliveryCompanies } from "@/features/mine-secondary/server/orders-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const context = createBffRequestContext(request);
  const result = await fetchDeliveryCompanies({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/orders/delivery-companies"
  });

  return toBffResponse(result);
}
