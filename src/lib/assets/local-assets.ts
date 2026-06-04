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
  "promotion.talentSummaryCard.v5": "/assets/promotion/talent-badges/talent-summary-card-v5.png"
} as const;

export type LocalAssetKey = keyof typeof localAssetPaths;

export function localAssetUrl(key: LocalAssetKey, options?: AssetUrlOptions) {
  return assetUrl(localAssetPaths[key], options);
}
