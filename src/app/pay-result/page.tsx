import { PayResultScreen } from "@/features/payment/components/PayResultScreen";
import { ProductNotFoundScreen } from "@/features/product/components/ProductDetailScreen";

type PayResultPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PayResultPage({ searchParams }: PayResultPageProps) {
  const params = await searchParams;
  const orderNumbers = normalizeParam(params?.orderNumbers);

  if (!orderNumbers) {
    return <ProductNotFoundScreen />;
  }

  return (
    <PayResultScreen
      bizOrderNo={normalizeParam(params?.bizOrderNo)}
      dvyType={normalizeParam(params?.dvyType) || "1"}
      orderNumbers={orderNumbers}
      orderType={normalizeParam(params?.orderType) || "0"}
      ordermold={normalizeParam(params?.ordermold) || "0"}
      status={normalizeStatus(normalizeParam(params?.sts))}
    />
  );
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeStatus(value: string) {
  return value === "0" || value === "1" || value === "pending" ? value : "pending";
}
