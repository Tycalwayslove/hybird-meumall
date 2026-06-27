import { RefundDetailScreen } from "@/features/mine-secondary/components/RefundDetailScreen";

type RefundDetailPageProps = {
  params: Promise<{
    refundSn: string;
  }>;
};

export default async function RefundDetailPage({ params }: RefundDetailPageProps) {
  const { refundSn } = await params;

  return <RefundDetailScreen refundSn={decodeURIComponent(refundSn)} />;
}
