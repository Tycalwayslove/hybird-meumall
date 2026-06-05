import { notFound } from "next/navigation";

import { PromotionActivityDetailScreen } from "@/features/promotion/components/PromotionActivityDetailScreen";
import { getPromotionActivityDetail } from "@/features/promotion/server/promotion-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PromotionActivityDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PromotionActivityDetailPage({ params }: PromotionActivityDetailPageProps) {
  const { slug } = await params;
  const data = getPromotionActivityDetail(slug);

  if (!data) {
    notFound();
  }

  return <PromotionActivityDetailScreen data={data} />;
}
