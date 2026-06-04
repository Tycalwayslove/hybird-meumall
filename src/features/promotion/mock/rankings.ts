import type { RankCenterData, RankingData, RankingPeriod, RankingType } from "../types";

export const rankCenter: RankCenterData = {
  sections: [
    {
      id: "talent",
      title: "达人榜",
      items: [
        {
          id: "talent-sales",
          title: "达人销量榜",
          subtitle: "每日更新",
          href: "/promotion/ranking/sales",
          theme: "blue"
        },
        {
          id: "talent-amount",
          title: "达人销售额榜",
          subtitle: "每日更新",
          href: "/promotion/ranking/amount",
          theme: "gold"
        },
        {
          id: "talent-incentive",
          title: "达人激励榜",
          subtitle: "每日更新",
          href: "/promotion/rank-center",
          theme: "pink"
        }
      ]
    },
    {
      id: "team",
      title: "战队榜",
      items: [
        {
          id: "team-sales",
          title: "战队销量榜",
          subtitle: "每日更新",
          href: "/promotion/rank-center",
          theme: "green"
        },
        {
          id: "team-amount",
          title: "战队销售额榜",
          subtitle: "每日更新",
          href: "/promotion/rank-center",
          theme: "purple"
        }
      ]
    }
  ]
};

const names = ["杭州喵小雪", "深圳喵小猫", "广州喵可可", "成都喵果果", "南京喵晴", "厦门喵安安", "武汉喵米", "苏州喵七"];

export function buildRanking(type: RankingType, period: RankingPeriod): RankingData {
  const unit = type === "sales" ? "单" : "元";
  const values =
    type === "sales"
      ? ["962", "836", "731", "689", "541", "397", "266", "198"]
      : ["9621374", "8364200", "7310390", "6891120", "541880", "397620", "266480", "198200"];

  return {
    rankingType: type,
    activePeriod: period,
    periodText: period === "day" ? "榜单周期：2026.7.1" : "榜单周期：2026.7.1-2026.7.31",
    tabs: [
      { id: "sales", title: "达人销量榜", href: "/promotion/ranking/sales" },
      { id: "amount", title: "达人销售额榜", href: "/promotion/ranking/amount" }
    ],
    rows: values.map((value, index) => ({
      rank: index + 1,
      name: names[index] ?? `喵呜达人${index + 1}`,
      avatar: null,
      value,
      unit
    })),
    currentUser: {
      rank: type === "sales" ? 23 : 0,
      name: "深圳喵小猫",
      avatar: null,
      value: type === "sales" ? "137" : "--",
      unit,
      onList: type === "sales"
    }
  };
}
