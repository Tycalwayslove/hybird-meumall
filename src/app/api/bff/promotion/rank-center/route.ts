import { bffJson, getPromotionRankCenter, requestIdFrom } from "@/features/promotion/server/promotion-service";

export function GET(request: Request) {
  return bffJson(getPromotionRankCenter(), requestIdFrom(request, "promotion-rank-center"));
}
