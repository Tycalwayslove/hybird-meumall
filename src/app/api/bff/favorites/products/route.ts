import { fetchFavoriteProductsData } from "@/features/mine-secondary/server/collections-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";
import { toBffResponse } from "@/server/http/bff-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = createBffRequestContext(request);
  const result = await fetchFavoriteProductsData({
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    current: Number(url.searchParams.get("current") ?? 1),
    javaOssAssetBaseUrl: process.env.JAVA_OSS_ASSET_BASE_URL,
    route: "/api/bff/favorites/products",
    size: Number(url.searchParams.get("size") ?? 20)
  });

  return toBffResponse(result);
}
