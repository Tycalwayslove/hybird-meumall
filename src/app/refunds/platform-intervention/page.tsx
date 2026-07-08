import { PlatformInterventionScreen } from "@/features/mine-secondary/components/OrderAfterSaleScreens";

type PlatformInterventionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlatformInterventionPage({ searchParams }: PlatformInterventionPageProps) {
  const params = await searchParams;
  const refundSn = Array.isArray(params?.refundSn) ? params.refundSn[0] : params?.refundSn || "";
  const pageType = Number(Array.isArray(params?.pageType) ? params.pageType[0] : params?.pageType) === 2 ? 2 : 1;

  return <PlatformInterventionScreen pageType={pageType} refundSn={refundSn} />;
}
