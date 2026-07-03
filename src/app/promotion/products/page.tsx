import { PromotionProductsScreen } from "@/features/promotion/components/PromotionProductsScreen";

type PromotionProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PromotionProductsPage({ searchParams }: PromotionProductsPageProps) {
  const params = await searchParams;
  const incentiveId = normalizeParam(params?.incentiveId);

  return <PromotionProductsScreen incentiveId={incentiveId || undefined} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
