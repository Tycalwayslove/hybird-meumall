import { addBankCard } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

type AddBankCardBody = {
  acctNum?: unknown;
  cerNum?: unknown;
  phone?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AddBankCardBody;
  const context = createBffRequestContext(request);
  const result = await addBankCard({
    acctNum: String(body.acctNum ?? ""),
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    cerNum: String(body.cerNum ?? ""),
    phone: String(body.phone ?? ""),
    route: "/api/bff/wallet/bank-cards/apply"
  });

  return toBffResponse(result);
}
