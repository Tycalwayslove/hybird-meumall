import type { LocalAssetKey } from "@/lib/assets";

export type HomeQuickCategory = {
  iconUrl?: string;
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
  imageUrl?: string;
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
    assetKey?: LocalAssetKey;
    imageUrl?: string;
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

export const fixedHomeActivityCards = [
  {
    title: "限时秒杀",
    subtitle: "让实惠飞一会",
    href: "/seckill",
    backgroundAssetKey: "home.activity.seckillBg"
  },
  {
    title: "推广带货",
    subtitle: "佣金至高50%!",
    href: "/promotion/products",
    backgroundAssetKey: "home.activity.promotionBg"
  }
] as const satisfies readonly HomeActivityCard[];

export function createEmptyHomeExperienceData(fallbackData: HomeExperienceData): HomeExperienceData {
  return {
    activities: [...fixedHomeActivityCards],
    banner: {
      alt: "",
      href: ""
    },
    categories: [],
    logoAssetKey: fallbackData.logoAssetKey,
    messageAssetKey: fallbackData.messageAssetKey,
    moreAssetKey: fallbackData.moreAssetKey,
    products: [],
    recommendationIconAssetKey: fallbackData.recommendationIconAssetKey,
    seckillLabelAssetKey: fallbackData.seckillLabelAssetKey,
    talentPriceTagAssetKey: fallbackData.talentPriceTagAssetKey
  };
}
