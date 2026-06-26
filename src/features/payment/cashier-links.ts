import { buildClientHref } from "@/lib/navigation";

export function createCashierHrefFromSubmitResult({
  dvyType = "1",
  isPurePoints = "0",
  orderNumbers,
  orderType = "0",
  ordermold = "0"
}: {
  dvyType?: string;
  isPurePoints?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
}) {
  const query = new URLSearchParams({
    orderNumbers,
    dvyType,
    isPurePoints,
    orderType,
    ordermold
  });

  return buildClientHref(`/pay-way?${query.toString()}`);
}
