import { PromotionBenefitsScreen } from "@/features/promotion/components/PromotionBenefitsScreen";
import {
  getAllPromotionBenefits,
  normalizeTalentLevel
} from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BenefitsPageProps = {
  searchParams?: Promise<{
    level?: string;
  }>;
};

export default async function PromotionBenefitsPage({ searchParams }: BenefitsPageProps) {
  const params = await searchParams;
  const initialLevel = normalizeTalentLevel(params?.level);
  const levels = getAllPromotionBenefits();

  return <PromotionBenefitsScreen initialLevel={initialLevel} levels={levels} />;
}
