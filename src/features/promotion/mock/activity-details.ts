import type { ActivityDetailSlug, PromotionActivityDetailData } from "../types";

const activityRuleRows: Array<[string, string]> = [
  ["第一名", "4888元"],
  ["第二名", "4588元"],
  ["第三名", "3988元"],
  ["第四名", "3688元"]
];

const baseRules = {
  description: "活动期间累计有效单量排名前170名的战队可获得PK排位奖",
  columns: ["战队排名", "奖金"] as [string, string],
  rows: activityRuleRows
};

export const promotionActivityDetails: Record<ActivityDetailSlug, PromotionActivityDetailData> = {
  "open-order-july": {
    slug: "open-order-july",
    title: {
      prefix: "7月",
      highlight: "开单",
      suffix: "有礼",
      highlightTone: "order"
    },
    heroBackgroundAssetKey: "promotion.activityDetailHero.order",
    rewardRecordHref: "/promotion/activities/reward-records",
    badgeText: "10单以上可获额外激励",
    statusText: "去带货",
    statusKind: "primary",
    actionHref: "/promotion/products",
    periodText: "活动时间：2026.7.1-2026.7.31",
    metrics: {
      kind: "single",
      label: "累计订单量",
      value: "15"
    },
    progress: {
      completedText: "当前活动已有1718完成",
      hintText: "您已获得5元激励金，再完成5单可获得10元奖励",
      percent: 55,
      amountLabels: ["0元", "5元", "10元"],
      milestoneLabels: ["0单", "5单", "10单"]
    },
    rules: baseRules
  },
  "pk-july": {
    slug: "pk-july",
    title: {
      prefix: "7月",
      highlight: "PK",
      suffix: "有礼",
      highlightTone: "pk"
    },
    heroBackgroundAssetKey: "promotion.activityDetailHero.pk",
    rewardRecordHref: "/promotion/activities/reward-records",
    badgeText: "销售额TOP10可获额外激励",
    statusText: "去领奖",
    statusKind: "primary",
    periodText: "活动时间：2026.7.1-2026.7.31",
    metrics: {
      kind: "split",
      items: [
        { label: "当前排名", value: "3" },
        { label: "销售额", value: "981234" }
      ]
    },
    progress: {
      completedText: "当前活动已有1718完成",
      hintText: "再完成50,000销售额可进入TOP10",
      percent: 55,
      milestoneLabels: ["TOP20", "TOP10", "TOP1"]
    },
    rules: baseRules
  },
  "pk-june": {
    slug: "pk-june",
    title: {
      prefix: "6月",
      highlight: "PK",
      suffix: "有礼",
      highlightTone: "pk"
    },
    heroBackgroundAssetKey: "promotion.activityDetailHero.pk",
    rewardRecordHref: "/promotion/activities/reward-records",
    badgeText: "销售额TOP10可获额外激励",
    statusText: "活动已结束",
    statusKind: "neutral",
    periodText: "活动时间：2026.6.1-2026.6.30",
    metrics: {
      kind: "split",
      items: [
        { label: "当前排名", value: "3" },
        { label: "销售额", value: "981234" }
      ]
    },
    progress: {
      completedText: "当前活动已有1718完成",
      hintText: "再完成50,000销售额可进入TOP10",
      percent: 55,
      milestoneLabels: ["TOP20", "TOP10", "TOP1"]
    },
    rules: baseRules
  }
};

export function getPromotionActivityDetailBySlug(slug: string): PromotionActivityDetailData | null {
  return promotionActivityDetails[slug as ActivityDetailSlug] ?? null;
}
