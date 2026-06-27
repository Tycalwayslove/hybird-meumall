import { headers } from "next/headers";
import { PromotionBenefitsScreen } from "@/features/promotion/components/PromotionBenefitsScreen";
import { PromotionErrorState } from "@/features/promotion/components/PromotionStates";
import { fetchPromotionBenefitsData } from "@/features/promotion/server/promotion-level-real-service";
import { normalizeTalentLevel } from "@/features/promotion/server/promotion-service";
import { createBffRequestContext } from "@/server/http/bff-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BenefitsPageProps = {
  searchParams?: Promise<{
    level?: string;
  }>;
};

export default async function PromotionBenefitsPage({ searchParams }: BenefitsPageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const request = new Request("http://h5.local/api/bff/promotion/benefits", {
    headers: new Headers(requestHeaders)
  });
  const context = createBffRequestContext(request);
  const result = await fetchPromotionBenefitsData({
    authRequired: true,
    authToken: context.getAuthToken("java"),
    backendClient: context.backendClient,
    clientContext: context.clientContext
  });

  if (!result.ok) {
    return <PromotionErrorState description={result.error.message} title="权益中心加载失败" />;
  }

  const queryLevel = normalizeTalentLevel(params?.level);
  const initialLevel = result.data.levels.some((level) => level.profile.level === queryLevel) ? queryLevel : result.data.activeLevel;

  return <PromotionBenefitsScreen initialLevel={initialLevel} levels={result.data.levels} />;
}
