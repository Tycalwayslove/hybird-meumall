import { fetchBankCardsData } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const context = createBffRequestContext(request);
  const result = await fetchBankCardsData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/wallet/bank-cards"
  });

  return toBffResponse(result);
}
