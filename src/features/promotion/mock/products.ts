export type PromotionProductItem = {
  id: string;
  href?: string;
  imageUrl?: string;
  title: string;
  sales: number;
  userPrice: number;
  estimatedCommission: number;
  commissionRate: string;
  isFavorite?: boolean;
};

export const promotionProducts: PromotionProductItem[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `promotion-product-${index + 1}`,
  title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
  sales: 384 + index * 12,
  userPrice: 628,
  estimatedCommission: 68,
  commissionRate: "50%"
}));
