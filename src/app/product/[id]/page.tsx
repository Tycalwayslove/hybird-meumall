import { ProductDetailScreen, ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";
import { createProductLoadingData, getProductDetailById } from "@/features/product/server/product-detail-service";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const addressId = normalizeParam(query?.addressId);
  const product = getProductDetailById(id);

  if (!product) {
    if (isRemoteProductId(id)) {
      return <ProductDetailScreen data={createProductLoadingData(id)} initialAddressId={addressId} />;
    }

    return <ProductNotFoundScreen />;
  }

  return <ProductDetailScreen data={product} initialAddressId={addressId} />;
}

function isRemoteProductId(id: string) {
  return /^\d+$/.test(id);
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
