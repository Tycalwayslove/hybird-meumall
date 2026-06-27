import { PromotionRankingScreen } from "@/features/promotion/components/PromotionRankingScreen";
import { createPromotionIncentiveRankingEmptyData } from "@/features/promotion/server/promotion-ranking-real-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RankingPageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

export default async function PromotionIncentiveRankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;

  return <PromotionRankingScreen data={createPromotionIncentiveRankingEmptyData(params?.period)} />;
}
