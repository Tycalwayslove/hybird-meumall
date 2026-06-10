import type { SearchPageData } from "../types";

export const searchPageData: SearchPageData = {
  hotKeywords: ["保健品", "米罗地儿", "生鲜", "家用除菌仪"],
  historyKeywords: ["保健品", "米罗地儿", "生鲜", "家用除菌仪", "米罗地儿", "生鲜", "家用除菌仪"],
  rankingTabs: ["喵呜热榜", "生鲜", "饮料", "火锅食材", "服饰", "药品", "电器"],
  activeRankingTab: "喵呜热榜",
  rankingNotice: "官方榜单 · 真实数据 · 每周更新",
  categories: ["零食饮料", "生鲜熟食", "保健品", "家用电器", "书籍"],
  products: [
    {
      id: "summer-cotton-tee-seckill",
      href: "/product/p-1001",
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
      href: "/product/p-1001",
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
      href: "/product/p-1001",
      title: "棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      feature: "精选优质姜根提取物",
      price: 628,
      originalPrice: 998,
      soldText: "已售: 1w+",
      badge: { type: "talent", label: "喵呜达人", level: "V2" },
      imageTone: "mint"
    }
  ],
  resultProducts: Array.from({ length: 8 }).map((_, index) => ({
    id: `search-result-${index + 1}`,
    href: "/product/p-1001",
    title: "夏季纯棉短袖的恤男女同款宽松百搭休闲圆领上衣",
    feature: "精选优质姜根提取物",
    price: index === 5 ? 928 : 368,
    originalPrice: 998,
    soldText: "已售 2300",
    badge: { type: "talent", label: "喵呜达人", level: "V2" },
    imageTone: index % 3 === 0 ? "charcoal" : index % 3 === 1 ? "linen" : "mint",
    tag: index === 5 ? "推荐" : "热卖"
  }))
};
