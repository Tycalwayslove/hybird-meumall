import type { LocalAssetKey } from "@/lib/assets";

export type HomeQuickCategory = {
  label: string;
  href: string;
};

export type HomeActivityCard = {
  title: string;
  subtitle: string;
  href: string;
  backgroundAssetKey: LocalAssetKey;
  labelAssetKey?: LocalAssetKey;
};

export type HomeProductCard = {
  id: string;
  title: string;
  href: string;
  badge: "热卖" | "推荐";
  price: string;
  originalPrice: string;
  soldText: string;
  promoType?: "seckill" | "talent";
};

export type HomeExperienceData = {
  logoAssetKey: LocalAssetKey;
  messageAssetKey: LocalAssetKey;
  banner: {
    href: string;
    assetKey: LocalAssetKey;
    alt: string;
  };
  categories: HomeQuickCategory[];
  activities: HomeActivityCard[];
  recommendationIconAssetKey: LocalAssetKey;
  moreAssetKey: LocalAssetKey;
  talentPriceTagAssetKey: LocalAssetKey;
  seckillLabelAssetKey: LocalAssetKey;
  products: HomeProductCard[];
};
