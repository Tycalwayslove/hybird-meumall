import { localAssetUrl } from "@/lib/assets";

import type { PromotionHomeData } from "../types";

function formatMoney(value: number) {
  return `¥${value}`;
}

export function TalentSummaryCard({ data, isDark }: { data: PromotionHomeData; isDark: boolean }) {
  const { profile, theme } = data;
  const cardBackground = localAssetUrl(theme.summaryCardAssetKey);

  return (
    <section
      className="relative mt-[34px] h-[114px] overflow-hidden rounded-bl-[14px] rounded-br-[34px] rounded-tl-[14px] rounded-tr-[14px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundColor: theme.accentColor,
        backgroundImage: `url(${cardBackground}), ${theme.cardGradient}`
      }}
    >
      <div className="absolute left-[15px] top-[9px] flex w-[calc(100%-30px)] items-center justify-between">
        <div className="flex min-w-0 items-center gap-[3px]">
          <p className="text-[15px] font-semibold leading-[18px]" style={{ color: theme.summaryTextColor }}>
            我的带货
          </p>
          <span className="rounded-pill bg-fill-white px-1.5 py-[2px] text-[12px] font-bold leading-none" style={{ color: theme.summaryTextColor }}>
            {profile.level.toUpperCase()}
            {profile.levelName}
          </span>
        </div>
        <span className={`relative size-[18px] rounded-full border-2 ${isDark ? "border-fill-white" : "border-text-primary"}`}>
          <span className={`absolute left-[5px] top-[5px] size-1 rounded-full ${isDark ? "bg-fill-white" : "bg-text-primary"}`} />
        </span>
      </div>
      <div
        className={`absolute inset-x-[18px] bottom-[16px] grid grid-cols-[1fr_1px_1fr] items-center ${
          isDark ? "text-text-inverse" : "text-text-primary"
        }`}
      >
        <div>
          <p className="text-[14px] leading-[18px] opacity-90">累计佣金(元)</p>
          <p className="mt-[10px] max-w-[128px] truncate text-[clamp(19px,6vw,22px)] font-black leading-[18px]">
            {formatMoney(data.summary.totalCommission)}
          </p>
        </div>
        <div className="h-6 bg-text-primary/10" />
        <div className="pl-8">
          <p className="whitespace-nowrap text-[14px] leading-[18px] opacity-90">累计带货金额(元)</p>
          <p className="mt-[10px] max-w-[128px] truncate text-[clamp(19px,6vw,22px)] font-black leading-[18px]">
            {formatMoney(data.summary.totalSalesAmount)}
          </p>
        </div>
      </div>
    </section>
  );
}
