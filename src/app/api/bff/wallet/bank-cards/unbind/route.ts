import { unbindBankCard } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type UnbindBankCardBody = {
  acctNum?: unknown;
  signNum?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as UnbindBankCardBody;
  const context = createBffRequestContext(request);
  const result = await unbindBankCard({
    acctNum: String(body.acctNum ?? ""),
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    route: "/api/bff/wallet/bank-cards/unbind",
    signNum: String(body.signNum ?? "")
  });

  return toBffResponse(result);
}
