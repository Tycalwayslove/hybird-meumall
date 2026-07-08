import { ReturnLogisticsScreen } from "@/features/mine-secondary/components/OrderAfterSaleScreens";

type ReturnLogisticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReturnLogisticsPage({ searchParams }: ReturnLogisticsPageProps) {
  const params = await searchParams;
  const refundSn = Array.isArray(params?.refundSn) ? params.refundSn[0] : params?.refundSn || "";
  const isModify = Number(Array.isArray(params?.isModify) ? params.isModify[0] : params?.isModify) === 1;

  return <ReturnLogisticsScreen isModify={isModify} refundSn={refundSn} />;
}
