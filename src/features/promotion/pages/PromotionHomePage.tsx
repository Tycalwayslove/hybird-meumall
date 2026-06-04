import { AppScreen } from "@/design-system";

import { PromotionMetricGrid } from "../components/PromotionMetricGrid";
import { PromotionQuickEntryGrid } from "../components/PromotionQuickEntryGrid";
import { PromotionToolGrid } from "../components/PromotionToolGrid";
import { TalentHero } from "../components/TalentHero";
import type { PromotionHomeData } from "../types";

export function PromotionHomePage({ data }: { data: PromotionHomeData }) {
  return (
    <AppScreen>
      <TalentHero data={data} />
      <div className="relative mt-sectionGap space-y-sectionGap px-screenX pb-8">
        <PromotionQuickEntryGrid entries={data.quickEntries} />
        <PromotionMetricGrid metrics={data.metrics} />
        <PromotionToolGrid tools={data.tools} />
      </div>
    </AppScreen>
  );
}
