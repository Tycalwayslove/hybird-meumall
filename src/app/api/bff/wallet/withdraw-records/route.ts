import { fetchWalletWithdrawRecordsData } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = createBffRequestContext(request);
  const result = await fetchWalletWithdrawRecordsData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    current: Number(url.searchParams.get("current") ?? 1),
    route: "/api/bff/wallet/withdraw-records",
    size: Number(url.searchParams.get("size") ?? 10)
  });

  return toBffResponse(result);
}
