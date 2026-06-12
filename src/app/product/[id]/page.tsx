import { ProductDetailScreen, ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";
import { createProductLoadingData, getProductDetailById } from "@/features/product/server/product-detail-service";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductDetailById(id);

  if (!product) {
    if (isRemoteProductId(id)) {
      return <ProductDetailScreen data={createProductLoadingData(id)} />;
    }

    return <ProductNotFoundScreen />;
  }

  return <ProductDetailScreen data={product} />;
}

function isRemoteProductId(id: string) {
  return /^\d+$/.test(id);
}
