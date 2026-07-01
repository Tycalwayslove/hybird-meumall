import { fetchWalletHistoryStatusData } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const context = createBffRequestContext(request);
  const result = await fetchWalletHistoryStatusData({
    authToken: context.getAuthToken("python"),
    backendClient: context.backendClient,
    route: "/api/bff/wallet/history-status"
  });

  return toBffResponse(result);
}
