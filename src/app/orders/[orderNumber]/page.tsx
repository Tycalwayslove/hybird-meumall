import { OrderDetailScreen } from "@/features/mine-secondary/components/OrderDetailScreen";

type OrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;

  return <OrderDetailScreen orderNumber={decodeURIComponent(orderNumber)} />;
}
