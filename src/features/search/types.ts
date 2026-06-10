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
  href: string;
  title: string;
  feature: string;
  price: number;
  originalPrice: number;
  soldText: string;
  badge: SearchProductBadge;
  imageTone: SearchProductImageTone;
};

export type SearchResultProduct = SearchProduct & {
  tag: "热卖" | "推荐";
};

export type SearchFilterState = "none" | "sales" | "category" | "price";

export type SearchPageData = {
  hotKeywords: string[];
  historyKeywords: string[];
  rankingTabs: string[];
  activeRankingTab: string;
  rankingNotice: string;
  products: SearchProduct[];
  resultProducts: SearchResultProduct[];
  categories: string[];
};
