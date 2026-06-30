import { fetchWalletData, type WalletState } from "@/features/mine-secondary/server/wallet-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = createBffRequestContext(request);
  const state = url.searchParams.get("state") === "pending" ? "pending" : "settled";
  const result = await fetchWalletData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    current: Number(url.searchParams.get("current") ?? 1),
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    route: "/api/bff/wallet",
    size: Number(url.searchParams.get("size") ?? 10),
    state: state as WalletState
  });

  return toBffResponse(result);
}
