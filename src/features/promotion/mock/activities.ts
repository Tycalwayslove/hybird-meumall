import type { PromotionActivitiesData } from "../types";

export const promotionActivities: PromotionActivitiesData = {
  activeCount: 3,
  rewardRecordHref: "/promotion/activities/reward-records",
  items: [
    {
      id: "monthly-2026-07",
      href: "/promotion/activities/open-order-july",
      tag: "订单",
      iconKind: "order",
      title: "7月订单激励活动",
      status: "active",
      description: "完成100单订单销售，可获额外1000元订单激励",
      periodText: "活动时间：2026.7.1-2026.7.31",
      progressLabel: "目前进度:",
      progressValue: "30%",
      progressPercent: 30
    },
    {
      id: "team-2026-07",
      href: "/promotion/activities/pk-july",
      tag: "PK",
      iconKind: "pk",
      title: "7月战队PK活动",
      status: "claiming",
      statusText: "领奖中",
      description: "完成100单订单销售，可获额外1000元订单激励",
      periodText: "活动时间：2026.7.1-2026.7.31",
      progressLabel: "目前排名:",
      progressValue: "12",
      progressPercent: 80
    },
    {
      id: "newcomer-2026-06",
      href: "/promotion/activities/pk-june",
      tag: "PK",
      iconKind: "pk",
      title: "6月战队PK活动",
      status: "ended",
      statusText: "已结束",
      description: "完成100单订单销售，可获额外1000元订单激励",
      periodText: "活动时间：2026.6.1-2026.6.30",
      progressLabel: "目前进度:",
      progressValue: "100%",
      progressPercent: 100
    }
  ]
};
