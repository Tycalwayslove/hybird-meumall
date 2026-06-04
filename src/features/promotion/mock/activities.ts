import type { PromotionActivitiesData } from "../types";

export const promotionActivities: PromotionActivitiesData = {
  couponSummary: "可使用优惠券3个",
  rewardRecordHref: "/promotion/activities",
  items: [
    {
      id: "monthly-2026-07",
      tag: "月度激励",
      title: "7月订单激励活动",
      status: "claiming",
      statusText: "领奖中",
      description: "完成指定订单目标即可领取奖励，奖励可在活动结束后统一发放。",
      periodText: "活动时间：2026.7.1-2026.7.31",
      progressLabel: "目前进度",
      progressValue: "90%"
    },
    {
      id: "team-2026-07",
      tag: "战队激励",
      title: "7月战队冲榜活动",
      status: "active",
      statusText: "进行中",
      description: "战队成员共同完成带货目标后，队长和成员均可获得对应激励。",
      periodText: "活动时间：2026.7.1-2026.7.31",
      progressLabel: "目前排名",
      progressValue: "2"
    },
    {
      id: "newcomer-2026-06",
      tag: "新人激励",
      title: "6月新人首单活动",
      status: "ended",
      statusText: "已结束",
      description: "完成首单推广后获得新人体验单品和专属培训资料。",
      periodText: "活动时间：2026.6.1-2026.6.30",
      progressLabel: "最终进度",
      progressValue: "100%"
    }
  ]
};
