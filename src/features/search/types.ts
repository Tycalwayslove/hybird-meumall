export type SearchProductBadge =
  | {
      type: "hot";
      label: string;
    }
  | {
      type: "recommend";
      label: string;
    }
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
  badge?: SearchProductBadge;
  feature: string;
  id: string;
  href: string;
  imageUrl?: string;
  imageTone?: SearchProductImageTone;
  originalPrice: number;
  price: number;
  priceSubText?: {
    kind: "discount" | "original";
    text: string;
  };
  soldText: string;
  title: string;
};

export type SearchResultProduct = SearchProduct & {
  tag: "热卖" | "推荐";
};

export type SearchFilterState = "none" | "sales" | "category" | "price";

export type SearchPageData = {
  hotKeywords: string[];
  historyKeywords: string[];
  rankingTabs: SearchRankingTab[];
  activeRankingTab: string;
  rankingNotice: string;
  products: SearchProduct[];
  resultProducts: SearchResultProduct[];
  categories: string[];
};

export type SearchRankingTab = {
  categoryId?: string;
  id: string;
  label: string;
  rankType: 1 | 2;
};
