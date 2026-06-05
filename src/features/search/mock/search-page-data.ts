import type { SearchPageData } from "../types";

export const searchPageData: SearchPageData = {
  hotKeywords: ["保健品", "米罗地儿", "生鲜", "家用除菌仪"],
  historyKeywords: ["保健品", "米罗地儿", "生鲜", "家用除菌仪", "米罗地儿", "生鲜", "家用除菌仪"],
  rankingTabs: ["喵呜热榜", "生鲜", "饮料", "火锅食材", "服饰", "药品", "电器"],
  activeRankingTab: "喵呜热榜",
  rankingNotice: "官方榜单 · 真实数据 · 每周更新",
  products: [
    {
      id: "summer-cotton-tee-seckill",
      title: "棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      feature: "精选优质姜根提取物",
      price: 628,
      originalPrice: 998,
      soldText: "已售: 2000+",
      badge: { type: "seckill", label: "限时秒杀" },
      imageTone: "charcoal"
    },
    {
      id: "summer-cotton-tee-talent-1",
      title: "棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      feature: "精选优质姜根提取物",
      price: 628,
      originalPrice: 998,
      soldText: "已售: 1w+",
      badge: { type: "talent", label: "喵呜达人", level: "V2" },
      imageTone: "linen"
    },
    {
      id: "summer-cotton-tee-talent-2",
      title: "棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      feature: "精选优质姜根提取物",
      price: 628,
      originalPrice: 998,
      soldText: "已售: 1w+",
      badge: { type: "talent", label: "喵呜达人", level: "V2" },
      imageTone: "mint"
    }
  ]
};
