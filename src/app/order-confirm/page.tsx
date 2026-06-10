import { OrderConfirmScreen } from "@/features/product/components/OrderConfirmScreen";
import { ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";
import { getOrderConfirmData } from "@/features/product/server/order-confirm-service";

type OrderConfirmPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderConfirmPage({ searchParams }: OrderConfirmPageProps) {
  const params = await searchParams;
  const data = getOrderConfirmData({
    addressMode: normalizeParam(params?.address),
    productId: normalizeParam(params?.productId),
    quantity: normalizeParam(params?.quantity),
    skuId: normalizeParam(params?.skuId)
  });

  if (!data) {
    return <ProductNotFoundScreen />;
  }

  return <OrderConfirmScreen data={data} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
