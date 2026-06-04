import type { PromotionHomeData, TalentLevel, TalentTheme } from "../types";

export const talentLevels: Record<
  TalentLevel,
  {
    levelName: string;
    commissionLabel: string;
    persona: string;
    progress: number;
    unlockText: string;
    theme: TalentTheme;
  }
> = {
  v1: {
    levelName: "新锐达人",
    commissionLabel: "基础佣金",
    persona: "私域新手，刚建社群 / 朋友圈带货，重点孵化拉新。",
    progress: 38,
    unlockText: "100可解锁",
    theme: {
      name: "peach",
      accentColor: "#FFAA79",
      textOnHero: "dark",
      badgeAssetKey: "talent-badge-v1",
      heroGradient: "linear-gradient(180deg, #FAD1BC 0%, #FFFFFF 100%)",
      cardGradient: "linear-gradient(180deg, #F8C8B0 0%, #FFE3CF 100%)",
      summaryTextColor: "#8D410E",
      progressColor: "#FFAA79",
      glowColor: "rgba(255, 170, 121, 0.36)"
    }
  },
  v2: {
    levelName: "白银达人",
    commissionLabel: "基础 * 120%",
    persona: "有固定私域社群、稳定出单，能做基础复购转化。",
    progress: 138,
    unlockText: "200可解锁",
    theme: {
      name: "blue",
      accentColor: "#6F9FFF",
      textOnHero: "dark",
      badgeAssetKey: "talent-badge-v2",
      heroGradient: "linear-gradient(180deg, #B9DDF6 0%, #FFFFFF 100%)",
      cardGradient: "linear-gradient(180deg, #95C8F0 0%, #D6EDFF 100%)",
      summaryTextColor: "#203B8A",
      progressColor: "#6F9FFF",
      glowColor: "rgba(111, 159, 255, 0.32)"
    }
  },
  v3: {
    levelName: "黄金达人",
    commissionLabel: "基础 * 150%",
    persona: "多社群运营、私域裂变强、复购高。",
    progress: 238,
    unlockText: "已解锁",
    theme: {
      name: "gold",
      accentColor: "#FFC039",
      textOnHero: "dark",
      badgeAssetKey: "talent-badge-v3",
      heroGradient: "linear-gradient(180deg, #FFF1DB 0%, #FFFFFF 100%)",
      cardGradient: "linear-gradient(180deg, #FFCD8B 0%, #FFEBBF 100%)",
      summaryTextColor: "#7F3000",
      progressColor: "#FFC039",
      glowColor: "rgba(255, 192, 57, 0.42)"
    }
  },
  v4: {
    levelName: "星钻达人",
    commissionLabel: "基础 * 180%",
    persona: "多社群运营、私域裂变强、复购高。",
    progress: 438,
    unlockText: "300可解锁",
    theme: {
      name: "purple",
      accentColor: "#C573FF",
      textOnHero: "dark",
      badgeAssetKey: "talent-badge-v4",
      heroGradient: "linear-gradient(180deg, #D4C5F2 0%, #FFFFFF 100%)",
      cardGradient: "linear-gradient(180deg, #C6A6F5 0%, #EFE5FF 100%)",
      summaryTextColor: "#58007A",
      progressColor: "#C573FF",
      glowColor: "rgba(197, 115, 255, 0.34)"
    }
  },
  v5: {
    levelName: "至尊达人",
    commissionLabel: "基础 * 200%",
    persona: "私域头部 IP、自有圈层资源、可裂变招商、带团队孵化。",
    progress: 438,
    unlockText: "400可解锁",
    theme: {
      name: "blackPurple",
      accentColor: "#8F84FF",
      textOnHero: "light",
      badgeAssetKey: "talent-badge-v5",
      heroGradient: "linear-gradient(180deg, #15004E 0%, #825EA6 100%)",
      cardGradient: "linear-gradient(180deg, #1D007B 0%, #6A49D6 100%)",
      summaryTextColor: "#FFFFFF",
      progressColor: "#8F84FF",
      glowColor: "rgba(143, 132, 255, 0.46)"
    }
  }
};

const quickEntries = [
  {
    id: "activities",
    title: "奖励活动",
    subtitle: "3个进行中",
    iconKey: "promotion-gift",
    href: "/promotion/activities"
  },
  {
    id: "rank-center",
    title: "排行榜",
    subtitle: "看看谁是第一",
    iconKey: "promotion-rank",
    href: "/promotion/rank-center"
  }
];

const metrics = [
  { id: "todayVisits", label: "今日店铺访问", value: "+45" },
  { id: "todayOrders", label: "今日带货订单", value: "+27" },
  { id: "todayIncome", label: "今日带货收益", value: "¥83" },
  { id: "totalVisits", label: "累计店铺访问", value: "3678" },
  { id: "totalOrders", label: "累计带货订单", value: "893" },
  { id: "totalFavorites", label: "累计店铺收藏", value: "5683" }
];

const tools = [
  { id: "products", title: "商品推广", iconKey: "promotion-tool-product", href: "/promotion/products" },
  { id: "guide", title: "赚钱攻略", iconKey: "promotion-tool-guide", href: "/promotion/activities" },
  { id: "analytics", title: "访客分析", iconKey: "promotion-tool-analytics", href: "/promotion/rank-center" },
  { id: "card", title: "推广名片", iconKey: "promotion-tool-card", href: "/promotion/card" }
];

export function buildPromotionHome(level: TalentLevel): PromotionHomeData {
  const levelMeta = talentLevels[level];
  const isV5 = level === "v5";

  return {
    profile: {
      nickname: "深圳喵小猫",
      avatar: null,
      level,
      levelName: levelMeta.levelName,
      progress: {
        current: levelMeta.progress,
        target: 500,
        unit: "growth"
      }
    },
    theme: levelMeta.theme,
    summary: {
      totalCommission: isV5 ? 38675083 : 383,
      totalSalesAmount: isV5 ? 66757883 : 683,
      currency: "CNY"
    },
    quickEntries,
    metrics,
    tools
  };
}
