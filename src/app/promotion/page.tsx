import { headers } from "next/headers";
import { PromotionHomeScreen } from "@/features/promotion/components/PromotionHomeScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionHomeOverviewData } from "@/features/promotion/server/promotion-home-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PromotionPage() {
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/promotion/home", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchPromotionHomeOverviewData({
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} />;
  }

  return <PromotionHomeScreen data={result.data} />;
}
