import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PromotionActivityRewardScreen } from "@/features/promotion/components/PromotionActivityRewardScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionIncentiveRewardDetailData } from "@/features/promotion/server/promotion-incentive-activities-real-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PromotionActivityRewardPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
  }>;
};

export default async function PromotionActivityRewardPage({ params, searchParams }: PromotionActivityRewardPageProps) {
  const { slug } = await params;
  if (!/^\d+$/.test(slug)) {
    notFound();
  }

  const mode = normalizeRewardMode((await searchParams)?.mode);
  const requestHeaders = await headers();
  const request = new Request(`http://h5.local/api/bff/promotion/activities/${slug}/reward`, {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchPromotionIncentiveRewardDetailData({
    activityId: slug,
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} title="奖励详情加载失败" />;
  }

  if (!result.data.view) {
    return <PromotionErrorState description="暂无可查看的奖励详情" title="奖励详情加载失败" />;
  }

  return <PromotionActivityRewardScreen data={result.data.view} mode={mode} />;
}

function normalizeRewardMode(value: string | undefined) {
  return value === "view" ? "view" : "receive";
}
