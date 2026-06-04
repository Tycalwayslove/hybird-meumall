import { bffJson, getPromotionActivities, requestIdFrom } from "@/features/promotion/server/promotion-service";

export function GET(request: Request) {
  return bffJson(getPromotionActivities(), requestIdFrom(request, "promotion-activities"));
}
