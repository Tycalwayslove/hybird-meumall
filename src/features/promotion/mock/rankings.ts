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

const names = ["SoulKeeper", "暖阳如初", "云养猫大师", "吃瓜路过", "咖啡因上瘾", "NightWalker_", "夜猫子传说", "温柔乡主_", "浮生若梦_", "LightAngel_"];

export function buildRanking(type: RankingType, period: RankingPeriod): RankingData {
  const unit = type === "sales" ? "单" : "元";
  const values =
    type === "sales"
      ? ["1737", "337", "237", "137", "75", "24", "18", "12", "9", "6"]
      : ["9621374", "621374", "96213", "21374", "11374", "9809", "4578", "1290", "998", "6"];

  return {
    rankingType: type,
    activePeriod: period,
    periodText: "榜单周期：2026.7.1-2026.7.31",
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
      name: "深圳喵小喵",
      avatar: null,
      value: type === "sales" ? "137" : "--",
      unit,
      onList: type === "sales"
    }
  };
}
