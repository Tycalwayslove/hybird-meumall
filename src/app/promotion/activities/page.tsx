import { headers } from "next/headers";
import { PromotionActivitiesScreen } from "@/features/promotion/components/PromotionActivitiesScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionIncentiveActivitiesData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PromotionActivitiesPage() {
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/promotion/activities", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const [ongoingResult, pausedResult] = await Promise.all([
    fetchPromotionIncentiveActivitiesData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      displayStates: [1, 2, 3, 4],
      orderBy: "-createTime"
    }),
    fetchPromotionIncentiveActivitiesData({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backendClient: context.backendClient,
      clientContext: context.clientContext,
      displayStates: [0],
      orderBy: "-createTime"
    })
  ]);

  if (!ongoingResult.ok) {
    return <PromotionErrorState description={ongoingResult.error.message} title="活动中心加载失败" />;
  }

  if (!pausedResult.ok) {
    return <PromotionErrorState description={pausedResult.error.message} title="活动中心加载失败" />;
  }

  return <PromotionActivitiesScreen ongoingData={ongoingResult.data} pausedData={pausedResult.data} />;
}
