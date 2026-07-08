import { ChooseRefundWayScreen } from "@/features/mine-secondary/components/OrderAfterSaleScreens";

type ChooseRefundWayPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChooseRefundWayPage({ searchParams }: ChooseRefundWayPageProps) {
  const params = await searchParams;
  const refundType = Number(Array.isArray(params?.refundType) ? params.refundType[0] : params?.refundType) === 1 ? 1 : 2;

  return <ChooseRefundWayScreen refundType={refundType} />;
}
