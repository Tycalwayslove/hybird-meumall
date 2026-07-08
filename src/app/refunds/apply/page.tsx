import { RefundApplyScreen } from "@/features/mine-secondary/components/OrderAfterSaleScreens";

type RefundApplyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RefundApplyPage({ searchParams }: RefundApplyPageProps) {
  const params = await searchParams;
  const applyType = Number(Array.isArray(params?.type) ? params.type[0] : params?.type) === 2 ? 2 : 1;
  const refundType = Number(Array.isArray(params?.refundType) ? params.refundType[0] : params?.refundType) === 1 ? 1 : 2;

  return <RefundApplyScreen applyType={applyType} refundType={refundType} />;
}
