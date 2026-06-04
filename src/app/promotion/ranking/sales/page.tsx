import { PromotionRankingScreen } from "@/features/promotion/components/PromotionRankingScreen";
import { getPromotionRanking } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RankingPageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

export default async function PromotionSalesRankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;

  return <PromotionRankingScreen data={getPromotionRanking("sales", params?.period)} />;
}
