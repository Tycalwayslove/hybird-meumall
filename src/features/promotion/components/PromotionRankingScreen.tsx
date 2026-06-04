import Link from "next/link";

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
    <main className="min-h-screen bg-[#F7F9FB] text-[#0F0F0F]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden pb-[92px]">
        <section className="relative min-h-[294px] overflow-hidden bg-[linear-gradient(180deg,#FF725F_0%,#FFB45A_100%)] px-4 pt-[calc(env(safe-area-inset-top)+52px)] text-white">
          <div className="absolute -left-16 top-10 size-44 rounded-full bg-white/10 blur-[18px]" />
          <div className="absolute right-[-54px] top-[-36px] size-52 rounded-full bg-white/20 blur-[26px]" />
          <Link aria-label="返回榜单中心" className="absolute left-4 top-[calc(env(safe-area-inset-top)+18px)] size-4 rotate-45 border-b-2 border-l-2 border-white" href="/promotion/rank-center" />
          <h1 className="text-center text-[18px] font-semibold leading-[26px]">{title}</h1>

          <div className="mt-5 flex rounded-full bg-white/18 p-1 text-[13px] font-semibold">
            {data.tabs.map((tab) => {
              const active = tab.id === data.rankingType;
              return (
                <Link key={tab.id} className={`flex-1 rounded-full py-2 text-center ${active ? "bg-white text-[#D25F00]" : "text-white"}`} href={tab.href}>
                  {tab.title}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {periods.map((period) => (
              <Link
                key={period.id}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${period.id === data.activePeriod ? "bg-[#0F0F0F] text-white" : "bg-white/24 text-white"}`}
                href={`${currentPath}?period=${period.id}`}
              >
                {period.label}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] leading-5 text-white/80">{data.periodText}</p>

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
            <div className="overflow-hidden rounded-[16px] bg-white">
              {rest.map((row) => (
                <div key={row.rank} className="flex min-h-[66px] items-center gap-3 border-b border-[#F2F3F5] px-4 last:border-b-0">
                  <span className="w-7 text-[15px] font-black text-[#86909C]">{row.rank}</span>
                  <PromotionAvatar className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#0F0F0F]">{row.name}</p>
                    <p className="mt-1 text-[11px] text-[#86909C]">每日更新</p>
                  </div>
                  <span className="shrink-0 text-[15px] font-black text-[#D25F00]">{formatRankValue(row.value, row.unit)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="mx-auto flex max-w-[398px] items-center gap-3 rounded-[14px] bg-[#0F0F0F] px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <span className="w-8 text-[15px] font-black">{data.currentUser.onList ? data.currentUser.rank : "--"}</span>
            <PromotionAvatar className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{data.currentUser.name}</p>
              <p className="mt-1 text-[11px] text-white/60">{data.currentUser.onList ? "您当前排名" : "您未上榜"}</p>
            </div>
            <span className="shrink-0 text-[15px] font-black">{formatRankValue(data.currentUser.value, data.currentUser.unit)}</span>
          </div>
        </section>
      </div>
    </main>
  );
}
