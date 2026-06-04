import { PromotionBenefitsScreen } from "@/features/promotion/components/PromotionBenefitsScreen";
import { getPromotionBenefits } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BenefitsPageProps = {
  searchParams?: Promise<{
    level?: string;
  }>;
};

export default async function PromotionBenefitsPage({ searchParams }: BenefitsPageProps) {
  const params = await searchParams;
  const data = getPromotionBenefits(params?.level);

  return <PromotionBenefitsScreen data={data} />;
}
