import { bffJson, getPromotionHome, requestIdFrom } from "@/features/promotion/server/promotion-service";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return bffJson(getPromotionHome(searchParams.get("level")), requestIdFrom(request, "promotion-home"));
}
