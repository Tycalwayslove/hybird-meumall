import { TransparentActionNavPage } from "@/design-system";

import type { PromotionBenefitsData, TalentLevel } from "../types";
import { PromotionBenefitsCarousel } from "./PromotionBenefitsCarousel";

export function PromotionBenefitsScreen({
  initialLevel,
  levels
}: {
  initialLevel: TalentLevel;
  levels: PromotionBenefitsData[];
}) {
  return (
    <TransparentActionNavPage
      backHref="/mine"
      foreground="light"
      rightText="权益规则"
      title="权益中心"
    >
      <PromotionBenefitsCarousel initialLevel={initialLevel} levels={levels} />
    </TransparentActionNavPage>
  );
}
