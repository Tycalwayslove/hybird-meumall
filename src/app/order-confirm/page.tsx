import { OrderConfirmRuntimeScreen, OrderConfirmScreen } from "@/features/product/components/OrderConfirmScreen";
import { ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";
import { getOrderConfirmData } from "@/features/product/server/order-confirm-service";

type OrderConfirmPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderConfirmPage({ searchParams }: OrderConfirmPageProps) {
  const params = await searchParams;
  const addressId = normalizeParam(params?.addressId);
  const data = getOrderConfirmData({
    addressId,
    addressMode: normalizeParam(params?.address),
    productId: normalizeParam(params?.productId),
    quantity: normalizeParam(params?.quantity),
    skuId: normalizeParam(params?.skuId)
  });

  if (!data) {
    const productId = normalizeParam(params?.productId);
    const skuId = normalizeParam(params?.skuId);
    const quantity = normalizeParam(params?.quantity);

    if (productId && skuId) {
      return <OrderConfirmRuntimeScreen addressId={addressId} productId={productId} quantity={quantity} skuId={skuId} />;
    }

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
