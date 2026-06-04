import { TransparentActionNavPage } from "@/design-system";

import type { PromotionBenefitsData, TalentLevel } from "../types";
import { benefitsTheme } from "../theme/promotion-page-theme";
import { PromotionAvatar, PromotionIcon, TalentBadge } from "./PromotionAssetPlaceholder";

const levels: TalentLevel[] = ["v1", "v2", "v3", "v4", "v5"];

export function PromotionBenefitsScreen({ data }: { data: PromotionBenefitsData }) {
  const { profile, theme } = data;
  const activeIndex = levels.indexOf(profile.level);
  const isDark = theme.textOnHero === "light";

  return (
    <TransparentActionNavPage
      backHref="/promotion"
      foreground="light"
      rightText="权益规则"
      title="权益中心"
    >
      <div className="min-h-screen" style={{ background: benefitsTheme.pageBackground }}>
        <section className="relative min-h-[432px] overflow-hidden px-4 pt-[var(--meu-top-bar-height)] text-text-inverse" style={{ background: theme.heroGradient }}>
          <div className="absolute inset-0" style={{ background: benefitsTheme.heroHighlight }} />

          <div className="relative mt-4 flex items-center gap-[10px]">
            <PromotionAvatar className="size-12" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-[17px] font-black leading-6">{profile.nickname}</p>
                <span className="rounded-pill bg-fill-white px-1.5 py-[3px] text-[11px] font-black leading-none" style={{ color: isDark ? benefitsTheme.levelTextForDarkHero : theme.summaryTextColor }}>
                  {profile.level.toUpperCase()}{profile.levelName}
                </span>
              </div>
              <div className="mt-[6px] h-[5px] w-[200px] overflow-hidden rounded-pill bg-fill-white/20">
                <div className="h-full rounded-pill" style={{ width: `${Math.min(100, (profile.progress.current / profile.progress.target) * 100)}%`, background: theme.progressColor }} />
              </div>
              <p className="mt-[3px] text-[11px] font-semibold text-text-inverse/70">
                {profile.progress.current}/{profile.progress.target}
              </p>
            </div>
          </div>

          <div className="relative mt-7 flex justify-center">
            <TalentBadge assetKey={theme.badgeAssetKey} className="size-[116px]" level={profile.level} />
            <span className="absolute right-[calc(50%-104px)] top-0 rounded-pill bg-text-primary/24 px-2 py-1 text-[12px] font-semibold">{profile.progress.unlockText}</span>
          </div>

          <p className="relative mt-5 text-center text-[14px] leading-6 text-text-inverse">
            {profile.progress.nextTip}
          </p>

          <div className="relative mt-4 h-[52px]">
            <div className="absolute left-0 right-0 top-[10px] h-px bg-fill-white/45" />
            <div className="grid grid-cols-5">
              {levels.map((level, index) => (
                <div key={level} className="flex flex-col items-center gap-1">
                  <span className={`size-[7px] rounded-full ${index <= activeIndex ? "bg-fill-white" : "bg-fill-white/45"}`} />
                  <span
                    className={`text-[13px] leading-[14px] ${index === activeIndex ? "font-black" : ""}`}
                    style={{ color: index === activeIndex ? theme.progressColor : "rgb(var(--mm-color-text-inverse))" }}
                  >
                    {level.toUpperCase()}
                  </span>
                  {index === activeIndex ? <span className="text-[10px]" style={{ color: theme.progressColor }}>当前等级</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="-mt-[46px] rounded-t-[20px] px-4 pb-8 pt-5 text-text-inverse" style={{ background: benefitsTheme.contentBackground }}>
          <BenefitSection title={`${profile.level.toUpperCase()}${profile.levelName}专属特权`} items={data.exclusiveBenefits} />
          <div className="mt-5" />
          <BenefitSection title="喵呜达人会员特权" items={data.memberBenefits} />
          <div className="mt-5 rounded-[14px] bg-fill-white/[0.06] p-4">
            <p className="text-[14px] font-semibold text-text-inverse/90">达人定位</p>
            <p className="mt-2 text-[13px] leading-5 text-text-inverse/60">{data.persona}</p>
            <p className="mt-2 text-[13px] leading-5 text-text-inverse/60">佣金分成：{data.commission.label}</p>
          </div>
        </section>
      </div>
    </TransparentActionNavPage>
  );
}

function BenefitSection({
  title,
  items
}: {
  title: string;
  items: PromotionBenefitsData["exclusiveBenefits"];
}) {
  return (
    <section>
      <h2 className="flex items-center justify-center gap-2 text-center text-[16px] font-black leading-6">
        <span className="h-px w-[14px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${benefitsTheme.dividerColor} 100%)` }} />
        {title}
        <span className="h-px w-[14px]" style={{ background: `linear-gradient(90deg, ${benefitsTheme.dividerColor} 0%, transparent 100%)` }} />
      </h2>
      <div className="mt-[14px] space-y-5 rounded-[14px] bg-fill-white/[0.06] px-[14px] py-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-[13px]">
            <PromotionIcon className="size-[38px] rounded-full" iconKey={item.iconKey} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-5 text-text-inverse/90">{item.title}</p>
              <p className="mt-[2px] truncate text-[12px] leading-5 text-text-inverse/50">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
