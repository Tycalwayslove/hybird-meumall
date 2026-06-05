import { assetUrl, type AssetUrlOptions } from "./asset-url";

export const localAssetPaths = {
  "promotion.talentBadge.v1": "/assets/promotion/talent-badges/talent-badge-v1.png",
  "promotion.talentBadge.v2": "/assets/promotion/talent-badges/talent-badge-v2.png",
  "promotion.talentBadge.v3": "/assets/promotion/talent-badges/talent-badge-v3.png",
  "promotion.talentBadge.v4": "/assets/promotion/talent-badges/talent-badge-v4.png",
  "promotion.talentBadge.v5": "/assets/promotion/talent-badges/talent-badge-v5.png",
  "promotion.talentHeroBg.v1": "/assets/promotion/talent-badges/talent-hero-bg-v1.png",
  "promotion.talentHeroBg.v2": "/assets/promotion/talent-badges/talent-hero-bg-v2.png",
  "promotion.talentHeroBg.v3": "/assets/promotion/talent-badges/talent-hero-bg-v3.png",
  "promotion.talentHeroBg.v4": "/assets/promotion/talent-badges/talent-hero-bg-v4.png",
  "promotion.talentHeroBg.v5": "/assets/promotion/talent-badges/talent-hero-bg-v5.png",
  "promotion.talentSummaryCard.v1": "/assets/promotion/talent-badges/talent-summary-card-v1.png",
  "promotion.talentSummaryCard.v2": "/assets/promotion/talent-badges/talent-summary-card-v2.png",
  "promotion.talentSummaryCard.v3": "/assets/promotion/talent-badges/talent-summary-card-v3.png",
  "promotion.talentSummaryCard.v4": "/assets/promotion/talent-badges/talent-summary-card-v4.png",
  "promotion.talentSummaryCard.v5": "/assets/promotion/talent-badges/talent-summary-card-v5.png",
  "promotion.equityHeroBg.v1": "/assets/promotion/equity/equity-bg-v1.png",
  "promotion.equityHeroBg.v2": "/assets/promotion/equity/equity-bg-v2.png",
  "promotion.equityHeroBg.v3": "/assets/promotion/equity/equity-bg-v3.png",
  "promotion.equityHeroBg.v4": "/assets/promotion/equity/equity-bg-v4.png",
  "promotion.equityHeroBg.v5": "/assets/promotion/equity/equity-bg-v5.png",
  "promotion.equityArrow.next": "/assets/promotion/equity/equity-arrow-next.png",
  "promotion.equityArrow.prev": "/assets/promotion/equity/equity-arrow-prev.png",
  "promotion.equityIcon.money": "/assets/promotion/equity/equity-icon-money.png",
  "promotion.equityIcon.discount": "/assets/promotion/equity/equity-icon-discount.png",
  "promotion.equityIcon.cake": "/assets/promotion/equity/equity-icon-cake.png",
  "promotion.equityIcon.gift": "/assets/promotion/equity/equity-icon-gift.png",
  "promotion.equityIcon.coupon": "/assets/promotion/equity/equity-icon-coupon.png",
  "promotion.equityIcon.agent": "/assets/promotion/equity/equity-icon-agent.png",
  "promotion.equityIcon.box": "/assets/promotion/equity/equity-icon-box.png",
  "promotion.equityIcon.training": "/assets/promotion/equity/equity-icon-training.png",
  "promotion.equityIcon.ai": "/assets/promotion/equity/equity-icon-ai.png"
} as const;

export type LocalAssetKey = keyof typeof localAssetPaths;

export function localAssetUrl(key: LocalAssetKey, options?: AssetUrlOptions) {
  return assetUrl(localAssetPaths[key], options);
}
