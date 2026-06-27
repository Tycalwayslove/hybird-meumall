import { redirect } from "next/navigation";

type RefundDetailPageProps = {
  params: Promise<{
    refundSn: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RefundDetailPage({ params }: RefundDetailPageProps) {
  const { refundSn } = await params;

  redirect(`/refunds/${encodeURIComponent(decodeURIComponent(refundSn))}`);
}
