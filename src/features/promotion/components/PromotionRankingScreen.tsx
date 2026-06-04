import Link from "next/link";

import { TransparentNavPage } from "@/design-system";

import { rankingTheme } from "../theme/promotion-page-theme";
import type { RankingData, RankingPeriod } from "../types";
import { PromotionAvatar } from "./PromotionAssetPlaceholder";
import { PromotionEmptyState } from "./PromotionStates";

const periods: Array<{ id: RankingPeriod; label: string }> = [
  { id: "day", label: "日榜" },
  { id: "week", label: "周榜" },
  { id: "month", label: "月榜" }
];

function formatRankValue(value: string, unit: "单" | "元") {
  if (value === "--") {
    return "--";
  }
  return unit === "元" ? `¥${value}` : `${value}${unit}`;
}

export function PromotionRankingScreen({ data }: { data: RankingData }) {
  const title = data.rankingType === "sales" ? "达人销量榜" : "达人销售额榜";
  const currentPath = data.rankingType === "sales" ? "/promotion/ranking/sales" : "/promotion/ranking/amount";
  const podium = data.rows.slice(0, 3);
  const rest = data.rows.slice(3);

  return (
    <TransparentNavPage backHref="/promotion/rank-center" contentClassName="pb-[92px]" foreground="light">
      <section className="relative min-h-[294px] overflow-hidden px-4 pt-[var(--meu-top-bar-height)] text-text-inverse" style={{ background: rankingTheme.heroBackground }}>
        <div className="absolute -left-16 top-10 size-44 rounded-full bg-fill-white/10 blur-[18px]" />
        <div className="absolute right-[-54px] top-[-36px] size-52 rounded-full bg-fill-white/20 blur-[26px]" />
        <h1 className="text-center text-[18px] font-semibold leading-[26px]">{title}</h1>

        <div className="mt-5 flex rounded-pill bg-fill-white/18 p-1 text-[13px] font-semibold">
          {data.tabs.map((tab) => {
            const active = tab.id === data.rankingType;
            return (
              <Link key={tab.id} className={`flex-1 rounded-pill py-2 text-center ${active ? "bg-fill-white text-warning-strong" : "text-text-inverse"}`} href={tab.href}>
                {tab.title}
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {periods.map((period) => (
            <Link
              key={period.id}
              className={`rounded-pill px-4 py-1.5 text-[13px] font-semibold ${period.id === data.activePeriod ? "bg-text-primary text-text-inverse" : "bg-fill-white/24 text-text-inverse"}`}
              href={`${currentPath}?period=${period.id}`}
            >
              {period.label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] leading-5 text-text-inverse/80">{data.periodText}</p>

        <div className="mt-5 grid grid-cols-3 items-end gap-2">
          {[podium[1], podium[0], podium[2]].map((row, index) =>
            row ? (
              <div key={row.rank} className={`text-center ${index === 1 ? "pb-0" : "pb-3"}`}>
                <PromotionAvatar className={`mx-auto ${index === 1 ? "size-16" : "size-12"}`} />
                <p className="mt-2 text-[11px] font-black">NO.{row.rank}</p>
                <p className="mt-1 truncate text-[12px] font-semibold">{row.name}</p>
                <p className="mt-1 text-[13px] font-black">{formatRankValue(row.value, row.unit)}</p>
              </div>
            ) : null
          )}
        </div>
      </section>

      <section className="-mt-5 px-4">
        {data.rows.length === 0 ? (
          <PromotionEmptyState title="暂无榜单数据" />
        ) : (
          <div className="overflow-hidden rounded-sheet bg-fill-white">
            {rest.map((row) => (
              <div key={row.rank} className="flex min-h-[66px] items-center gap-3 border-b border-line px-4 last:border-b-0">
                <span className="w-7 text-[15px] font-black text-text-disabled">{row.rank}</span>
                <PromotionAvatar className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-text-primary">{row.name}</p>
                  <p className="mt-1 text-[11px] text-text-disabled">每日更新</p>
                </div>
                <span className="shrink-0 text-[15px] font-black text-warning-strong">{formatRankValue(row.value, row.unit)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto flex max-w-[398px] items-center gap-3 rounded-[14px] bg-text-primary px-4 py-3 text-text-inverse">
          <span className="w-8 text-[15px] font-black">{data.currentUser.onList ? data.currentUser.rank : "--"}</span>
          <PromotionAvatar className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{data.currentUser.name}</p>
            <p className="mt-1 text-[11px] text-text-inverse/60">{data.currentUser.onList ? "您当前排名" : "您未上榜"}</p>
          </div>
          <span className="shrink-0 text-[15px] font-black">{formatRankValue(data.currentUser.value, data.currentUser.unit)}</span>
        </div>
      </section>
    </TransparentNavPage>
  );
}
