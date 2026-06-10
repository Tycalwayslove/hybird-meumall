export type PromotionProductsFilter = "none" | "category" | "commission" | "property" | "sales" | "price";

export type PromotionProductItem = {
  id: string;
  title: string;
  sales: number;
  userPrice: number;
  estimatedCommission: number;
  commissionRate: string;
};

export const promotionProductFilters = {
  categories: ["零食饮料", "生鲜熟食", "保健品", "家用电器", "书籍"],
  commissions: ["佣金金额从大到小", "佣金金额从小到大", "佣金比例从高到低", "佣金比例从低到高"],
  properties: ["全部商品", "高佣商品", "活动商品", "新品商品"]
};

export const promotionProducts: PromotionProductItem[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `promotion-product-${index + 1}`,
  title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
  sales: 384 + index * 12,
  userPrice: 628,
  estimatedCommission: 68,
  commissionRate: "50%"
}));
