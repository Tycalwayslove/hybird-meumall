import type { PromotionBenefitsData, TalentLevel } from "../types";
import { PromotionAvatar, PromotionIcon, TalentBadge } from "./PromotionAssetPlaceholder";
import { PromotionNav, PromotionShell } from "./PromotionShell";

const levels: TalentLevel[] = ["v1", "v2", "v3", "v4", "v5"];

export function PromotionBenefitsScreen({ data }: { data: PromotionBenefitsData }) {
  const { profile, theme } = data;
  const activeIndex = levels.indexOf(profile.level);
  const isDark = theme.textOnHero === "light";

  return (
    <PromotionShell background="#160C35">
      <section className="relative min-h-[432px] overflow-hidden px-4 text-white" style={{ background: theme.heroGradient }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.22),transparent_36%)]" />
        <PromotionNav light title="权益中心" trailing={<span className="text-[14px] leading-[22px] text-white">权益规则</span>} />

        <div className="relative mt-4 flex items-center gap-[10px]">
          <PromotionAvatar className="size-12" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-[17px] font-black leading-6">{profile.nickname}</p>
              <span className="rounded-full bg-white px-1.5 py-[3px] text-[11px] font-black leading-none" style={{ color: isDark ? "#0B007E" : theme.summaryTextColor }}>
                {profile.level.toUpperCase()}{profile.levelName}
              </span>
            </div>
            <div className="mt-[6px] h-[5px] w-[200px] overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (profile.progress.current / profile.progress.target) * 100)}%`, background: theme.progressColor }} />
            </div>
            <p className="mt-[3px] text-[11px] font-semibold text-white/70">
              {profile.progress.current}/{profile.progress.target}
            </p>
          </div>
        </div>

        <div className="relative mt-7 flex justify-center">
          <TalentBadge className="size-[116px]" level={profile.level} />
          <span className="absolute right-[calc(50%-104px)] top-0 rounded-full bg-black/24 px-2 py-1 text-[12px] font-semibold">{profile.progress.unlockText}</span>
        </div>

        <p className="relative mt-5 text-center text-[14px] leading-6 text-white">
          {profile.progress.nextTip}
        </p>

        <div className="relative mt-4 h-[52px]">
          <div className="absolute left-0 right-0 top-[10px] h-px bg-white/45" />
          <div className="grid grid-cols-5">
            {levels.map((level, index) => (
              <div key={level} className="flex flex-col items-center gap-1">
                <span className={`size-[7px] rounded-full ${index <= activeIndex ? "bg-white" : "bg-white/45"}`} />
                <span className={`text-[13px] leading-[14px] ${index === activeIndex ? "font-black" : ""}`} style={{ color: index === activeIndex ? theme.progressColor : "#FFFFFF" }}>
                  {level.toUpperCase()}
                </span>
                {index === activeIndex ? <span className="text-[10px]" style={{ color: theme.progressColor }}>当前等级</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="-mt-[46px] rounded-t-[20px] bg-[#19103E] px-4 pb-8 pt-5 text-white">
        <BenefitSection title={`${profile.level.toUpperCase()}${profile.levelName}专属特权`} items={data.exclusiveBenefits} />
        <div className="mt-5" />
        <BenefitSection title="喵呜达人会员特权" items={data.memberBenefits} />
        <div className="mt-5 rounded-[14px] bg-white/[0.06] p-4">
          <p className="text-[14px] font-semibold text-white/90">达人定位</p>
          <p className="mt-2 text-[13px] leading-5 text-white/56">{data.persona}</p>
          <p className="mt-2 text-[13px] leading-5 text-white/56">佣金分成：{data.commission.label}</p>
        </div>
      </section>
    </PromotionShell>
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
        <span className="h-px w-[14px] bg-gradient-to-r from-transparent to-[#FFF0C9]" />
        {title}
        <span className="h-px w-[14px] bg-gradient-to-r from-[#FFF0C9] to-transparent" />
      </h2>
      <div className="mt-[14px] space-y-5 rounded-[14px] bg-white/[0.06] px-[14px] py-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-[13px]">
            <PromotionIcon className="size-[38px] rounded-full" iconKey={item.iconKey} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-5 text-white/90">{item.title}</p>
              <p className="mt-[2px] truncate text-[12px] leading-5 text-white/50">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
