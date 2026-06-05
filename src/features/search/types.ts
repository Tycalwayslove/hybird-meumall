export type SearchProductBadge =
  | {
      type: "seckill";
      label: string;
    }
  | {
      type: "talent";
      label: string;
      level: string;
    };

export type SearchProductImageTone = "charcoal" | "linen" | "mint";

export type SearchProduct = {
  id: string;
  title: string;
  feature: string;
  price: number;
  originalPrice: number;
  soldText: string;
  badge: SearchProductBadge;
  imageTone: SearchProductImageTone;
};

export type SearchPageData = {
  hotKeywords: string[];
  historyKeywords: string[];
  rankingTabs: string[];
  activeRankingTab: string;
  rankingNotice: string;
  products: SearchProduct[];
};
