import { cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";

import type { PromotionHomeData } from "../types";
import { PromotionAvatar, TalentBadge } from "./PromotionAssetPlaceholder";
import { TalentSummaryCard } from "./TalentSummaryCard";

export function TalentHero({ data }: { data: PromotionHomeData }) {
  const { profile, theme } = data;
  const isDark = theme.textOnHero === "light";
  const progressPercent = Math.min(100, Math.round((profile.progress.current / profile.progress.target) * 100));
  const heroBackground = localAssetUrl(theme.heroBackgroundAssetKey);

  return (
    <section
      className="relative min-h-[266px] overflow-hidden bg-top bg-no-repeat px-screenX pt-[calc(env(safe-area-inset-top)+62px)]"
      style={{
        backgroundColor: theme.accentColor,
        backgroundImage: `url(${heroBackground}), ${theme.heroGradient}`,
        backgroundSize: "100% 100%"
      }}
    >
      <div className="relative flex items-start gap-2">
        <div className="shrink-0">
          <PromotionAvatar className="size-14" />
        </div>
        <div className="min-w-0 pt-[2px]">
          <p className={cn("truncate text-[21px] font-black leading-[26px]", isDark ? "text-text-inverse" : "text-text-primary")}>{profile.nickname}</p>
          <div className="mt-[7px] h-[5px] w-[99px] overflow-hidden rounded-pill bg-fill-white">
            <div className="h-full rounded-pill" style={{ width: `${progressPercent}%`, background: theme.progressColor }} />
          </div>
          <p className="mt-[3px] text-[11px] font-semibold" style={{ color: isDark ? "rgb(var(--mm-color-text-inverse))" : theme.progressColor }}>
            {profile.progress.current}/{profile.progress.target}
          </p>
        </div>
        <div className="absolute right-[12px] top-[-4px] z-[2]">
          <TalentBadge assetKey={theme.badgeAssetKey} className="size-[116px]" level={profile.level} />
        </div>
      </div>

      <TalentSummaryCard data={data} isDark={isDark} />
    </section>
  );
}
