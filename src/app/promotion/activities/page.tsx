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
  const result = await fetchPromotionIncentiveActivitiesData({
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext,
    orderBy: "-createTime"
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} title="活动中心加载失败" />;
  }

  return <PromotionActivitiesScreen data={result.data} />;
}
