import { PromotionRewardRecordsScreen } from "@/features/promotion/components/PromotionRewardRecordsScreen";
import { getPromotionRewardRecords } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RewardRecordsPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function PromotionRewardRecordsPage({ searchParams }: RewardRecordsPageProps) {
  const params = await searchParams;

  return <PromotionRewardRecordsScreen data={getPromotionRewardRecords(params?.tab)} />;
}
