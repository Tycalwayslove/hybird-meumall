import Link from "next/link";

import { AppScreen, TopNavigation, UnderlineTabs } from "@/design-system";
import { localAssetUrl, type LocalAssetKey } from "@/lib/assets";

import { rewardRecordsTheme } from "../theme/promotion-page-theme";
import type { PromotionRewardRecordsData, RewardRecordItem } from "../types";
import { PromotionEmptyState } from "./PromotionStates";

const rewardRecordIconAssetKey: Record<RewardRecordItem["iconTone"], LocalAssetKey> = {
  settled: "promotion.rewardRecordIcon.settled",
  pending: "promotion.rewardRecordIcon.pending"
};

export function PromotionRewardRecordsScreen({ data }: { data: PromotionRewardRecordsData }) {
  return (
    <AppScreen className="bg-fill-page" contentClassName="relative h-screen min-h-screen overflow-y-auto pb-8">
      <img alt="" aria-hidden="true" className="absolute left-0 top-0 h-[250px] w-full object-cover object-top" src={localAssetUrl("promotion.rewardRecordsBg")} />
      <header className="relative z-10">
        <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />
        <TopNavigation backHref="/promotion/activities" background="transparent" title="奖励记录" />
      </header>

      <section className="relative z-10 mx-[14px] mt-[7px] overflow-hidden rounded-[18px] px-[18px] pb-3.5 pt-3.5 text-text-inverse" style={{ background: rewardRecordsTheme.summaryBackground }}>
        <div aria-hidden="true" className="absolute inset-0 opacity-80" style={{ background: rewardRecordsTheme.summaryGlow }} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[13px] leading-[18px] text-fill-page">已获得奖励(元)</p>
            <p className="mt-0.5 bg-clip-text text-[24px] font-black leading-[31px] text-transparent" style={{ backgroundImage: rewardRecordsTheme.valueGradient }}>
              {data.summary.totalReward}
            </p>
          </div>
          <Link className="rounded-pill px-4 py-[7px] text-[14px] font-medium leading-[18px] text-text-primary" href={data.summary.withdrawHref} style={{ backgroundColor: rewardRecordsTheme.actionBackground }}>
            提现
          </Link>
        </div>
        <div className="relative my-3 h-px rounded-pill" style={{ backgroundColor: rewardRecordsTheme.dividerColor }} />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center">
          <SummaryMetric label="已结算金额(元)" value={data.summary.settledAmount} />
          <div className="mx-4 h-7 w-px shrink-0 rounded-px" style={{ backgroundColor: rewardRecordsTheme.dividerColor }} />
          <SummaryMetric label="未结算金额(元)" value={data.summary.pendingAmount} />
        </div>
      </section>

      <section className="relative z-10 mx-[14px] mt-[19px] rounded-[14px] bg-fill-white pb-5 pt-3">
        <UnderlineTabs activeId={data.activeTab} tabs={data.tabs} />

        {data.records.length === 0 ? (
          <div className="mx-3 mt-5">
            <PromotionEmptyState title="暂无奖励记录" />
          </div>
        ) : (
          <div className="mx-3 mt-3.5 flex flex-col gap-4 py-2.5">
            {data.records.map((record, index) => (
              <RewardRecordRow key={record.id} record={record} showDivider={index < data.records.length - 1} />
            ))}
          </div>
        )}
      </section>
    </AppScreen>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap text-[13px] leading-[18px] text-fill-page">{label}</p>
      <p className="mt-1 text-[18px] font-black leading-[23px] text-text-inverse">{value}</p>
    </div>
  );
}

function RewardRecordRow({ record, showDivider }: { record: RewardRecordItem; showDivider: boolean }) {
  return (
    <div>
      <Link className="flex min-h-[42px] items-center justify-between gap-3" href={record.href}>
        <div className="flex min-w-0 items-center gap-[7px]">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full" style={{ background: record.iconTone === "pending" ? rewardRecordsTheme.pendingIconBackground : rewardRecordsTheme.settledIconBackground }}>
            <img alt="" className={record.iconTone === "pending" ? "h-[23px] w-4" : "h-[21px] w-[22px]"} src={localAssetUrl(rewardRecordIconAssetKey[record.iconTone])} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold leading-5 text-text-primary">{record.title}</span>
            <span className="mt-1 block truncate text-[13px] leading-[18px] text-text-secondary">{record.timeText}</span>
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-[16px] font-black leading-[18px] text-text-primary">{record.amount}</span>
          <span aria-hidden="true" className="size-2 rotate-45 border-r border-t border-text-tertiary" />
        </span>
      </Link>
      {showDivider ? <div className="mt-4 h-px bg-fill-muted" /> : null}
    </div>
  );
}
