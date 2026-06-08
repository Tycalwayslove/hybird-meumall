import Link from "next/link";

import { TransparentNavPage } from "@/design-system";
import { localAssetUrl, type LocalAssetKey } from "@/lib/assets";

import type { RankingData, RankingPeriod, RankingRow, RankingType } from "../types";
import { PromotionEmptyState } from "./PromotionStates";

const rankingTabs: Array<{ id: RankingType | "incentive"; title: string; href: string }> = [
  { id: "sales", title: "达人销量榜", href: "/promotion/ranking/sales" },
  { id: "amount", title: "达人销售额榜", href: "/promotion/ranking/amount" },
  { id: "incentive", title: "达人激励榜", href: "/promotion/rank-center" }
];

const periods: Array<{ id: RankingPeriod; label: string }> = [
  { id: "day", label: "日榜" },
  { id: "week", label: "周榜" },
  { id: "month", label: "月榜" }
];

const podiumAssets: Record<
  1 | 2 | 3,
  {
    card: LocalAssetKey;
    crown: LocalAssetKey;
    label: string;
    cardClassName: string;
    avatarClassName: string;
    crownClassName: string;
    crownWrapClassName: string;
    nameTopClassName: string;
    valueTopClassName: string;
    numberTopClassName: string;
    positionClassName: string;
  }
> = {
  1: {
    card: "promotion.rankingPodium.first",
    crown: "promotion.rankingCrown.first",
    label: "NO.1",
    cardClassName: "h-[133px]",
    avatarClassName: "size-[60px]",
    crownClassName: "size-[30px]",
    crownWrapClassName: "left-[calc(50%+8px)] top-[-49px]",
    nameTopClassName: "top-[62px]",
    numberTopClassName: "top-[32px]",
    valueTopClassName: "top-[84px]",
    positionClassName: "left-[120px] top-[166px] z-[2]"
  },
  2: {
    card: "promotion.rankingPodium.second",
    crown: "promotion.rankingCrown.second",
    label: "NO.2",
    cardClassName: "h-[111px]",
    avatarClassName: "size-[50px]",
    crownClassName: "size-[29px]",
    crownWrapClassName: "left-[calc(50%+8px)] top-[-43px]",
    nameTopClassName: "top-[55px]",
    numberTopClassName: "top-[25px]",
    valueTopClassName: "top-[77px]",
    positionClassName: "left-0 top-[188px] z-[1]"
  },
  3: {
    card: "promotion.rankingPodium.third",
    crown: "promotion.rankingCrown.third",
    label: "NO.3",
    cardClassName: "h-[111px]",
    avatarClassName: "size-[50px]",
    crownClassName: "size-[25px]",
    crownWrapClassName: "left-[calc(50%+10px)] top-[-40px]",
    nameTopClassName: "top-[55px]",
    numberTopClassName: "top-[25px]",
    valueTopClassName: "top-[77px]",
    positionClassName: "left-[240px] top-[188px] z-[1]"
  }
};

const avatarTones = [
  "linear-gradient(135deg, #111827 0%, #6B7280 100%)",
  "linear-gradient(135deg, #BEEBFF 0%, #357ABD 100%)",
  "linear-gradient(135deg, #FFE3D3 0%, #FF8B5E 100%)",
  "linear-gradient(135deg, #203A43 0%, #2C5364 100%)",
  "linear-gradient(135deg, #F87171 0%, #7F1D1D 100%)",
  "linear-gradient(135deg, #FDE68A 0%, #92400E 100%)",
  "linear-gradient(135deg, #DDD6FE 0%, #4338CA 100%)",
  "linear-gradient(135deg, #FBCFE8 0%, #9D174D 100%)",
  "linear-gradient(135deg, #A7F3D0 0%, #047857 100%)",
  "linear-gradient(135deg, #E0E7FF 0%, #3730A3 100%)"
];

function rawRankValue(value: string, unit: "单" | "元") {
  if (value === "--") {
    return "--";
  }
  return unit === "元" ? `¥${value}` : `${value}${unit}`;
}

export function PromotionRankingScreen({ data }: { data: RankingData }) {
  const currentPath = data.rankingType === "sales" ? "/promotion/ranking/sales" : "/promotion/ranking/amount";
  const podium = data.rows.slice(0, 3);
  const rest = data.rows.slice(3);
  const rankingHeroBackground = localAssetUrl("promotion.rankingHeroBg");

  return (
    <TransparentNavPage
      backHref="/promotion/rank-center"
      className="bg-fill-muted"
      contentClassName="pb-[112px]"
      foreground="dark"
    >
      <section
        className="relative h-[calc(var(--meu-top-bar-height)+299px)] min-h-[343px] overflow-hidden bg-fill-muted"
        style={{
          backgroundImage: `url(${rankingHeroBackground})`,
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%"
        }}
      >
        <RankingTypeTabs activeType={data.rankingType} />
        <RankingPeriodTabs activePeriod={data.activePeriod} currentPath={currentPath} periodText={data.periodText} />

        {podium.length === 0 ? (
          <div className="absolute inset-x-4 top-[calc(var(--meu-top-bar-height)+166px)]">
            <PromotionEmptyState title="暂无榜单数据" />
          </div>
        ) : (
          <div className="absolute left-1/2 top-[var(--meu-top-bar-height)] h-[299px] w-[360px] -translate-x-1/2">
            {[podium[1], podium[0], podium[2]].map((row) => (row ? <PodiumCard key={row.rank} row={row} /> : null))}
          </div>
        )}
      </section>

      <section className="relative -mt-px rounded-t-[14px] bg-fill-white px-3 pb-6 pt-[18px]">
        {rest.length === 0 ? (
          <PromotionEmptyState title="暂无榜单数据" />
        ) : (
          <div className="flex flex-col gap-3">
            {rest.map((row) => (
              <RankingListRow key={row.rank} row={row} />
            ))}
          </div>
        )}
      </section>

      <CurrentUserBar currentUser={data.currentUser} />
    </TransparentNavPage>
  );
}

function RankingTypeTabs({ activeType }: { activeType: RankingType }) {
  return (
    <nav
      aria-label="排行榜类型"
      className="absolute inset-x-0 top-[var(--meu-top-bar-height)] z-10 flex h-[34px] items-start justify-between overflow-hidden px-2 py-1"
    >
      {rankingTabs.map((tab) => {
        const active = tab.id === activeType;
        return (
          <Link
            key={tab.id}
            aria-current={active ? "page" : undefined}
            className="relative flex h-[26px] min-w-0 shrink-0 items-start justify-center px-1.5"
            href={tab.href}
          >
            <span
              className={active ? "text-[16px] font-semibold leading-[22px] text-text-primary" : "text-[15px] font-medium leading-[22px] text-text-secondary"}
            >
              {tab.title}
            </span>
            {active ? <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-pill bg-brand-action" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function RankingPeriodTabs({
  activePeriod,
  currentPath,
  periodText
}: {
  activePeriod: RankingPeriod;
  currentPath: string;
  periodText: string;
}) {
  return (
    <div className="absolute left-1/2 top-[calc(var(--meu-top-bar-height)+44px)] z-10 flex w-[303px] -translate-x-1/2 flex-col items-center gap-2">
      <div className="w-full rounded-[12px] border-[1.2px] border-brand-normal bg-fill-white p-1">
        <div className="flex items-center justify-between">
          {periods.map((period) => {
            const active = period.id === activePeriod;
            return (
              <Link
                key={period.id}
                aria-current={active ? "page" : undefined}
                className="flex h-[30px] min-w-0 flex-1 items-center justify-center rounded-[10px] px-2 text-[14px] leading-none text-text-primary"
                href={`${currentPath}?period=${period.id}`}
                style={active ? { background: "rgb(var(--mm-color-brand-hover))", fontWeight: 600 } : undefined}
              >
                {period.label}
              </Link>
            );
          })}
        </div>
      </div>
      <p className="w-full text-center text-[13px] font-normal leading-none text-text-primary">{periodText}</p>
    </div>
  );
}

function PodiumCard({ row }: { row: RankingRow }) {
  const asset = podiumAssets[row.rank as 1 | 2 | 3];
  if (!asset) {
    return null;
  }

  return (
    <article className={`absolute w-[120px] ${asset.cardClassName} ${asset.positionClassName}`} aria-label={`${asset.label} ${row.name}`}>
      <RankAvatar className={`absolute left-1/2 z-[3] -translate-x-1/2 ${row.rank === 1 ? "top-[-30px]" : "top-[-27px]"} ${asset.avatarClassName}`} row={row} />
      <span className={`absolute z-[4] flex rotate-[30deg] items-center justify-center ${asset.crownWrapClassName}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local ranking crown is resolved through localAssetUrl for versioned basePath support. */}
        <img alt="" aria-hidden="true" className={`block object-contain ${asset.crownClassName}`} src={localAssetUrl(asset.crown)} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- local ranking podium background is resolved through localAssetUrl for versioned basePath support. */}
      <img alt="" aria-hidden="true" className="absolute inset-0 size-full object-fill" src={localAssetUrl(asset.card)} />
      <p className={`absolute left-1/2 z-[2] -translate-x-1/2 font-black leading-none text-text-primary ${asset.numberTopClassName}`}>
        <span className={row.rank === 1 ? "text-[16px]" : "text-[14px]"}>NO.</span>
        <span className={row.rank === 1 ? "text-[20px]" : "text-[18px]"}>{row.rank}</span>
      </p>
      <p className={`absolute left-1/2 z-[2] max-w-[108px] -translate-x-1/2 truncate text-[14px] font-medium leading-none text-text-secondary ${asset.nameTopClassName}`}>
        {row.name}
      </p>
      <p className={`absolute left-1/2 z-[2] max-w-[112px] -translate-x-1/2 truncate text-[16px] font-semibold leading-none text-function-price ${asset.valueTopClassName}`}>
        {rawRankValue(row.value, row.unit)}
      </p>
    </article>
  );
}

function RankingListRow({ row }: { row: RankingRow }) {
  return (
    <div className="flex min-h-[54px] items-center gap-2.5 rounded-[12px] bg-fill-muted px-2.5 py-[9px]">
      <span className="w-[22px] shrink-0 text-center text-[18px] font-black leading-none text-text-primary">{row.rank}</span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <RankAvatar className="size-9 shrink-0" row={row} />
          <p className="min-w-0 truncate text-[15px] font-medium leading-none text-text-primary">{row.name}</p>
        </div>
        <p className="shrink-0 text-right text-[15px] font-semibold leading-none text-function-price tabular-nums">{rawRankValue(row.value, row.unit)}</p>
      </div>
    </div>
  );
}

function CurrentUserBar({ currentUser }: { currentUser: RankingData["currentUser"] }) {
  return (
    <section className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 rounded-t-[16px] bg-fill-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 shadow-[0_-3px_20px_rgba(0,0,0,0.10)]">
      <div className="flex min-h-[54px] items-center gap-2.5 rounded-[12px] bg-fill-muted px-2.5 py-[9px]">
        <span className="w-[22px] shrink-0 text-center text-[18px] font-black leading-none text-text-primary">{currentUser.onList ? currentUser.rank : "--"}</span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <RankAvatar className="size-9 shrink-0" row={currentUser} />
            <p className="min-w-0 truncate text-[15px] font-medium leading-none text-text-primary">{currentUser.name}</p>
          </div>
          <p className="shrink-0 text-right text-[15px] font-semibold leading-none text-function-price tabular-nums">
            {currentUser.onList ? rawRankValue(currentUser.value, currentUser.unit) : "您未上榜"}
          </p>
        </div>
      </div>
    </section>
  );
}

function RankAvatar({ row, className = "" }: { row: Pick<RankingRow, "rank" | "name" | "avatar">; className?: string }) {
  const tone = avatarTones[Math.max(0, row.rank - 1) % avatarTones.length];

  if (row.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar may be a CMS URL or versioned local URL in future mock data.
      <img alt={row.name} className={`block rounded-full object-cover ${className}`} src={row.avatar} />
    );
  }

  return (
    <span
      aria-label={row.name}
      className={`inline-flex overflow-hidden rounded-full ring-2 ring-fill-white ${className}`}
      style={{ background: tone }}
      role="img"
    >
      <span className="flex size-full items-center justify-center bg-black/8 text-[12px] font-black text-fill-white">
        {row.name.slice(0, 1).toUpperCase()}
      </span>
    </span>
  );
}
