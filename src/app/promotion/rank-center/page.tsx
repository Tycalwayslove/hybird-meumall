import { PromotionRankCenterScreen } from "@/features/promotion/components/PromotionRankCenterScreen";
import { getPromotionRankCenter } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PromotionRankCenterPage() {
  return <PromotionRankCenterScreen data={getPromotionRankCenter()} />;
}
