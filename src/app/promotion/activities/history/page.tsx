import { headers } from "next/headers";

import { PromotionActivityHistoryScreen } from "@/features/promotion/components/PromotionActivitiesScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionIncentiveActivitiesData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PromotionActivityHistoryPage() {
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
    displayStates: [6],
    orderBy: "-createTime"
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} title="历史活动加载失败" />;
  }

  return <PromotionActivityHistoryScreen data={result.data} />;
}
