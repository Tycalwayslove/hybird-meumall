import { bffJson, getPromotionRanking, requestIdFrom } from "@/features/promotion/server/promotion-service";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return bffJson(getPromotionRanking("sales", searchParams.get("period")), requestIdFrom(request, "promotion-ranking-sales"));
}
