import Link from "next/link";

import type { PromotionHomeData } from "../types";
import { PromotionAvatar, PromotionIcon, TalentBadge } from "./PromotionAssetPlaceholder";
import { PromotionEmptyState } from "./PromotionStates";

function formatMoney(value: number) {
  return `¥${value}`;
}

export function PromotionHomeScreen({ data }: { data: PromotionHomeData }) {
  const { profile, theme } = data;
  const isDark = theme.textOnHero === "light";
  const textColor = isDark ? "text-white" : "text-[#0F0F0F]";
  const progressPercent = Math.min(100, Math.round((profile.progress.current / profile.progress.target) * 100));

  return (
    <main className="min-h-screen bg-[#F7F9FB] text-[#0F0F0F]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden">
        <section className="relative min-h-[266px] px-3 pt-[calc(env(safe-area-inset-top)+62px)]" style={{ background: theme.heroGradient }}>
          <div className="absolute inset-x-0 top-0 h-[260px] overflow-hidden">
            <div className="absolute -left-20 -top-24 size-[260px] rotate-45 bg-white/20 blur-[2px]" />
            <div className="absolute right-[-70px] top-[-80px] size-[220px] rounded-full bg-white/20 blur-[26px]" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[#F7F9FB]" />
          </div>

          <div className="relative flex items-start gap-2">
            <PromotionAvatar className="size-14 shrink-0" />
            <div className="min-w-0 pt-[2px]">
              <p className={`truncate text-[21px] font-black leading-[26px] ${textColor}`}>{profile.nickname}</p>
              <div className="mt-[7px] h-[5px] w-[99px] overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: theme.progressColor }} />
              </div>
              <p className="mt-[3px] text-[11px] font-semibold" style={{ color: isDark ? "#FFFFFF" : theme.progressColor }}>
                {profile.progress.current}/{profile.progress.target}
              </p>
            </div>
            <TalentBadge className="absolute right-[12px] top-[-4px] size-[116px]" level={profile.level} />
          </div>

          <section
            className="relative mt-[34px] h-[114px] overflow-hidden rounded-bl-[14px] rounded-br-[34px] rounded-tl-[14px] rounded-tr-[14px] border border-white/80"
            style={{ background: theme.cardGradient, boxShadow: `0 12px 26px ${theme.glowColor}` }}
          >
            <div className="absolute inset-x-[2px] bottom-[4px] h-[76px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-[32px] rounded-tr-[12px] bg-white/50" />
            <div className="absolute left-[15px] top-[9px] flex w-[calc(100%-30px)] items-center justify-between">
              <div className="flex min-w-0 items-center gap-[3px]">
                <p className="text-[15px] font-semibold leading-[18px]" style={{ color: theme.summaryTextColor }}>
                  我的带货
                </p>
                <span className="rounded-full bg-white px-1.5 py-[2px] text-[12px] font-bold leading-none" style={{ color: theme.summaryTextColor }}>
                  {profile.level.toUpperCase()}{profile.levelName}
                </span>
              </div>
              <span className={`relative size-[18px] rounded-full border-2 ${isDark ? "border-white" : "border-[#0F0F0F]"}`}>
                <span className={`absolute left-[5px] top-[5px] size-1 rounded-full ${isDark ? "bg-white" : "bg-[#0F0F0F]"}`} />
              </span>
            </div>
            <div className={`absolute inset-x-[18px] bottom-[16px] grid grid-cols-[1fr_1px_1fr] items-center ${isDark ? "text-white" : "text-[#0F0F0F]"}`}>
              <div>
                <p className="text-[14px] leading-[18px] opacity-90">累计佣金(元)</p>
                <p className="mt-[10px] max-w-[128px] truncate text-[clamp(19px,6vw,22px)] font-black leading-[18px]">
                  {formatMoney(data.summary.totalCommission)}
                </p>
              </div>
              <div className="h-6 bg-black/10" />
              <div className="pl-8">
                <p className="whitespace-nowrap text-[14px] leading-[18px] opacity-90">累计带货金额(元)</p>
                <p className="mt-[10px] max-w-[128px] truncate text-[clamp(19px,6vw,22px)] font-black leading-[18px]">
                  {formatMoney(data.summary.totalSalesAmount)}
                </p>
              </div>
            </div>
          </section>
        </section>

        <div className="relative mt-2 space-y-2 px-3 pb-8">
          <section className="grid grid-cols-2 gap-[10px]">
            {data.quickEntries.map((entry) => (
              <Link key={entry.id} className="flex h-[72px] items-center gap-3 rounded-[12px] bg-white px-[14px]" href={entry.href}>
                <PromotionIcon className="size-12" iconKey={entry.iconKey} />
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-black leading-[18px] text-[#9A1111]">{entry.title}</span>
                  <span className="mt-[6px] block truncate text-[13px] leading-[18px] text-[#474747]">{entry.subtitle}</span>
                </span>
              </Link>
            ))}
          </section>

          {data.metrics.length === 0 ? (
            <PromotionEmptyState title="暂无推广数据" />
          ) : (
            <section className="grid grid-cols-3 overflow-hidden rounded-[8px] bg-white">
              {data.metrics.map((metric) => (
                <div key={metric.id} className="flex h-20 flex-col items-center justify-center border-b border-r border-[#F2F3F5] last:border-r-0">
                  <p className="whitespace-nowrap text-[13px] leading-[18px] text-[#272727]">{metric.label}</p>
                  <p className="mt-2 text-[18px] font-black leading-[18px] text-[#0F0F0F]">{metric.value}</p>
                </div>
              ))}
            </section>
          )}

          <section className="rounded-[12px] bg-white px-[18px] pb-[18px] pt-[14px]">
            <h2 className="text-[15px] font-semibold leading-5">推广工具</h2>
            <div className="mt-[18px] grid grid-cols-4 gap-4">
              {data.tools.map((tool) => (
                <Link key={tool.id} className="flex min-w-0 flex-col items-center gap-1" href={tool.href}>
                  <PromotionIcon className="size-[30px] rounded-[10px]" iconKey={tool.iconKey} />
                  <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-[#575757]">{tool.title}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
