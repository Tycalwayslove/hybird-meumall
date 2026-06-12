import { OrdersScreen } from "@/features/mine-secondary/components/OrdersScreen";
import type { OrderStatus } from "@/features/mine-secondary/mock/data";

type OrdersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const status = Array.isArray(params?.status) ? params?.status[0] : params?.status;

  return <OrdersScreen initialStatus={normalizeOrderStatus(status)} />;
}

function normalizeOrderStatus(status: string | undefined): OrderStatus {
  const knownStatuses = new Set<OrderStatus>(["all", "pending-payment", "pending-shipment", "pending-receipt", "completed", "empty"]);
  return knownStatuses.has(status as OrderStatus) ? (status as OrderStatus) : "all";
}
