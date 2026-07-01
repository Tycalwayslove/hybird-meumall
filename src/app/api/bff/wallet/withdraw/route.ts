import { applyWalletWithdraw } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type WalletWithdrawBody = {
  amount?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as WalletWithdrawBody;
  const context = createBffRequestContext(request);
  const result = await applyWalletWithdraw({
    amount: body.amount,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/wallet/withdraw",
    walletUserMobile: context.auth.userInfo?.phone ?? null
  });

  return toBffResponse(result);
}
