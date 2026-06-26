import { PayWayRuntimeScreen } from "@/features/payment/components/PayWayScreen";
import { ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";

type PayWayPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PayWayPage({ searchParams }: PayWayPageProps) {
  const params = await searchParams;
  const orderNumbers = normalizeParam(params?.orderNumbers);

  if (!orderNumbers) {
    return <ProductNotFoundScreen />;
  }

  return (
    <PayWayRuntimeScreen
      dvyType={normalizeParam(params?.dvyType) || "1"}
      isPurePoints={normalizeParam(params?.isPurePoints) || "0"}
      orderNumbers={orderNumbers}
      orderType={normalizeParam(params?.orderType) || "0"}
      ordermold={normalizeParam(params?.ordermold) || "0"}
    />
  );
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
