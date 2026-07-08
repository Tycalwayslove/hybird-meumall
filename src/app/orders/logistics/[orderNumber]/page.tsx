import { OrderLogisticsScreen } from "@/features/mine-secondary/components/OrderAfterSaleScreens";

type OrderLogisticsPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderLogisticsPage({ params }: OrderLogisticsPageProps) {
  const { orderNumber } = await params;

  return <OrderLogisticsScreen orderNumber={decodeURIComponent(orderNumber)} />;
}
