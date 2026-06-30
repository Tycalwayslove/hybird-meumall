import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PromotionActivityDetailScreen } from "@/features/promotion/components/PromotionActivityDetailScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionIncentiveActivityDetailData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PromotionActivityDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PromotionActivityDetailPage({ params }: PromotionActivityDetailPageProps) {
  const { slug } = await params;
  if (!/^\d+$/.test(slug)) {
    notFound();
  }

  const requestHeaders = await headers();
  const request = new Request(`http://h5.local/api/bff/promotion/activities/${slug}`, {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchPromotionIncentiveActivityDetailData({
    activityId: slug,
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} title="活动详情加载失败" />;
  }

  return <PromotionActivityDetailScreen data={result.data} />;
}
