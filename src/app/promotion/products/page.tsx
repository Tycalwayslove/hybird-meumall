import { PromotionProductsScreen } from "@/features/promotion/components/PromotionProductsScreen";
import type { PromotionProductsFilter } from "@/features/promotion/mock/products";

type PromotionProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PromotionProductsPage({ searchParams }: PromotionProductsPageProps) {
  const params = await searchParams;
  const filter = normalizeParam(params?.filter) as PromotionProductsFilter | undefined;

  return <PromotionProductsScreen filter={filter ?? "none"} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
