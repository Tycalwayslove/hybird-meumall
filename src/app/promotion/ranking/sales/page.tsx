import { headers } from "next/headers";
import { PromotionRankingScreen } from "@/features/promotion/components/PromotionRankingScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionRankingData } from "@/features/promotion/server/promotion-ranking-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RankingPageProps = {
  searchParams?: Promise<{
    period?: string;
    statPeriod?: string;
  }>;
};

export default async function PromotionSalesRankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/promotion/rankings/sales", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchPromotionRankingData({
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    period: params?.period,
    rankingType: "sales",
    statPeriod: params?.statPeriod
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} />;
  }

  return <PromotionRankingScreen data={result.data} statPeriod={params?.statPeriod} />;
}
