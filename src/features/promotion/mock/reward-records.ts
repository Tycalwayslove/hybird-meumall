import type { PromotionRewardRecordsData, RewardRecordTab } from "../types";

const tabs = [
  { id: "settled", title: "已结算", href: "/promotion/activities/reward-records?tab=settled" },
  { id: "pending", title: "待结算", href: "/promotion/activities/reward-records?tab=pending" }
] as const;

const summary = {
  totalReward: "2383.43",
  settledAmount: "47548",
  pendingAmount: "2383",
  withdrawHref: "/promotion/commission"
};

const baseRecords = [
  { id: "reward-2026-08", title: "2026年8月奖励", timeText: "2025-09-25 17:05", settledAmount: "+98746.57", pendingAmount: "¥98746.57" },
  { id: "reward-2026-07", title: "2026年7月奖励", timeText: "2025-09-25 17:05", settledAmount: "+4657", pendingAmount: "+4657" },
  { id: "reward-2026-06", title: "2026年6月奖励", timeText: "2025-09-25 17:05", settledAmount: "+57", pendingAmount: "+57" },
  { id: "reward-2026-05", title: "2026年5月奖励", timeText: "2025-09-25 17:05", settledAmount: "+9874657", pendingAmount: "+9874657" },
  { id: "reward-2026-04", title: "2026年4月奖励", timeText: "2025-09-25 17:05", settledAmount: "+657", pendingAmount: "+657" }
] as const;

export function buildPromotionRewardRecords(activeTab: RewardRecordTab): PromotionRewardRecordsData {
  return {
    activeTab,
    summary,
    tabs: tabs.map((tab) => ({ ...tab })),
    records: baseRecords.map((record, index) => ({
      id: record.id,
      title: record.title,
      timeText: record.timeText,
      amount: activeTab === "pending" ? record.pendingAmount : record.settledAmount,
      iconTone: activeTab === "pending" && index === 0 ? "pending" : "settled",
      href: `/promotion/activities/reward-records/${record.id}`
    }))
  };
}
