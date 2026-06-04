import { PromotionActivitiesScreen } from "@/features/promotion/components/PromotionActivitiesScreen";
import { getPromotionActivities } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PromotionActivitiesPage() {
  return <PromotionActivitiesScreen data={getPromotionActivities()} />;
}
