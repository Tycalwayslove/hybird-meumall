import { PromotionHomeScreen } from "@/features/promotion/components/PromotionHomeScreen";
import { getPromotionHome } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PromotionPageProps = {
  searchParams?: Promise<{
    level?: string;
  }>;
};

export default async function PromotionPage({ searchParams }: PromotionPageProps) {
  const params = await searchParams;
  // const data = getPromotionHome("v1");
  const data = getPromotionHome(params?.level);

  return <PromotionHomeScreen data={data} />;
}
