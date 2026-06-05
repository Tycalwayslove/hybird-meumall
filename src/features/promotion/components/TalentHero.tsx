import Link from "next/link";

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
  const benefitsHref = `/promotion/benefits?level=${profile.level}`;

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
        <Link aria-label="查看达人权益中心" className="shrink-0 active:opacity-80" href={benefitsHref}>
          <PromotionAvatar className="size-14" />
        </Link>
        <Link aria-label="查看达人权益中心" className="min-w-0 pt-[2px] active:opacity-80" href={benefitsHref}>
          <p className={cn("truncate text-[21px] font-black leading-[26px]", isDark ? "text-text-inverse" : "text-text-primary")}>{profile.nickname}</p>
          <div className="mt-[7px] h-[5px] w-[99px] overflow-hidden rounded-pill bg-fill-white">
            <div className="h-full rounded-pill" style={{ width: `${progressPercent}%`, background: theme.progressColor }} />
          </div>
          <p className="mt-[3px] text-[11px] font-semibold" style={{ color: isDark ? "rgb(var(--mm-color-text-inverse))" : theme.progressColor }}>
            {profile.progress.current}/{profile.progress.target}
          </p>
        </Link>
        <Link aria-label="查看达人权益中心" className="absolute right-[12px] top-[-4px] z-[2] active:opacity-85" href={benefitsHref}>
          <TalentBadge assetKey={theme.badgeAssetKey} className="size-[116px]" level={profile.level} />
        </Link>
      </div>

      <TalentSummaryCard data={data} isDark={isDark} />
    </section>
  );
}
