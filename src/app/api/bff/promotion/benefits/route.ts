import { bffJson, getPromotionBenefits, requestIdFrom } from "@/features/promotion/server/promotion-service";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return bffJson(getPromotionBenefits(searchParams.get("level")), requestIdFrom(request, "promotion-benefits"));
}
