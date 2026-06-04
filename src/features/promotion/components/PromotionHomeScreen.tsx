import type { PromotionHomeData } from "../types";
import { PromotionHomePage } from "../pages/PromotionHomePage";

export function PromotionHomeScreen({ data }: { data: PromotionHomeData }) {
  return <PromotionHomePage data={data} />;
}
