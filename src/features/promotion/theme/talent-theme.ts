import type { LocalAssetKey } from "@/lib/assets";

import type { TalentLevel, TalentTheme } from "../types";

export const talentBadgeAssetKeyByLevel = {
  v1: "promotion.talentBadge.v1",
  v2: "promotion.talentBadge.v2",
  v3: "promotion.talentBadge.v3",
  v4: "promotion.talentBadge.v4",
  v5: "promotion.talentBadge.v5"
} as const satisfies Record<TalentLevel, LocalAssetKey>;

export const talentHeroBackgroundAssetKeyByLevel = {
  v1: "promotion.talentHeroBg.v1",
  v2: "promotion.talentHeroBg.v2",
  v3: "promotion.talentHeroBg.v3",
  v4: "promotion.talentHeroBg.v4",
  v5: "promotion.talentHeroBg.v5"
} as const satisfies Record<TalentLevel, LocalAssetKey>;

export const talentSummaryCardAssetKeyByLevel = {
  v1: "promotion.talentSummaryCard.v1",
  v2: "promotion.talentSummaryCard.v2",
  v3: "promotion.talentSummaryCard.v3",
  v4: "promotion.talentSummaryCard.v4",
  v5: "promotion.talentSummaryCard.v5"
} as const satisfies Record<TalentLevel, LocalAssetKey>;

export const equityHeroBackgroundAssetKeyByLevel = {
  v1: "promotion.equityHeroBg.v1",
  v2: "promotion.equityHeroBg.v2",
  v3: "promotion.equityHeroBg.v3",
  v4: "promotion.equityHeroBg.v4",
  v5: "promotion.equityHeroBg.v5"
} as const satisfies Record<TalentLevel, LocalAssetKey>;

export const equityArrowAssetKeys = {
  next: "promotion.equityArrow.next",
  prev: "promotion.equityArrow.prev"
} as const satisfies Record<"next" | "prev", LocalAssetKey>;

export const promotionLocalIconAssetKeyByIconKey: Record<string, LocalAssetKey> = {
  "benefit-money": "promotion.equityIcon.money",
  "benefit-discount": "promotion.equityIcon.discount",
  "benefit-cake": "promotion.equityIcon.cake",
  "benefit-coupon": "promotion.equityIcon.coupon",
  "benefit-gift": "promotion.equityIcon.gift",
  "benefit-agent": "promotion.equityIcon.agent",
  "benefit-box": "promotion.equityIcon.box",
  "benefit-bag": "promotion.equityIcon.training",
  "benefit-ai": "promotion.equityIcon.ai"
};

export const talentThemes = {
  v1: {
    name: "peach",
    accentColor: "#FFAA79",
    textOnHero: "dark",
    badgeAssetKey: talentBadgeAssetKeyByLevel.v1,
    heroBackgroundAssetKey: talentHeroBackgroundAssetKeyByLevel.v1,
    summaryCardAssetKey: talentSummaryCardAssetKeyByLevel.v1,
    heroGradient: "linear-gradient(180deg, #FAD1BC 0%, #FFFFFF 100%)",
    cardGradient: "linear-gradient(180deg, #F8C8B0 0%, #FFE3CF 100%)",
    summaryTextColor: "#8D410E",
    progressColor: "#FFAA79",
    glowColor: "rgba(255, 170, 121, 0.36)"
  },
  v2: {
    name: "blue",
    accentColor: "#6F9FFF",
    textOnHero: "dark",
    badgeAssetKey: talentBadgeAssetKeyByLevel.v2,
    heroBackgroundAssetKey: talentHeroBackgroundAssetKeyByLevel.v2,
    summaryCardAssetKey: talentSummaryCardAssetKeyByLevel.v2,
    heroGradient: "linear-gradient(180deg, #B9DDF6 0%, #FFFFFF 100%)",
    cardGradient: "linear-gradient(180deg, #95C8F0 0%, #D6EDFF 100%)",
    summaryTextColor: "#203B8A",
    progressColor: "#6F9FFF",
    glowColor: "rgba(111, 159, 255, 0.32)"
  },
  v3: {
    name: "gold",
    accentColor: "#FFC039",
    textOnHero: "dark",
    badgeAssetKey: talentBadgeAssetKeyByLevel.v3,
    heroBackgroundAssetKey: talentHeroBackgroundAssetKeyByLevel.v3,
    summaryCardAssetKey: talentSummaryCardAssetKeyByLevel.v3,
    heroGradient: "linear-gradient(180deg, #FFF1DB 0%, #FFFFFF 100%)",
    cardGradient: "linear-gradient(180deg, #FFCD8B 0%, #FFEBBF 100%)",
    summaryTextColor: "#7F3000",
    progressColor: "#FFC039",
    glowColor: "rgba(255, 192, 57, 0.42)"
  },
  v4: {
    name: "purple",
    accentColor: "#C573FF",
    textOnHero: "dark",
    badgeAssetKey: talentBadgeAssetKeyByLevel.v4,
    heroBackgroundAssetKey: talentHeroBackgroundAssetKeyByLevel.v4,
    summaryCardAssetKey: talentSummaryCardAssetKeyByLevel.v4,
    heroGradient: "linear-gradient(180deg, #D4C5F2 0%, #FFFFFF 100%)",
    cardGradient: "linear-gradient(180deg, #C6A6F5 0%, #EFE5FF 100%)",
    summaryTextColor: "#58007A",
    progressColor: "#C573FF",
    glowColor: "rgba(197, 115, 255, 0.34)"
  },
  v5: {
    name: "blackPurple",
    accentColor: "#8F84FF",
    textOnHero: "light",
    badgeAssetKey: talentBadgeAssetKeyByLevel.v5,
    heroBackgroundAssetKey: talentHeroBackgroundAssetKeyByLevel.v5,
    summaryCardAssetKey: talentSummaryCardAssetKeyByLevel.v5,
    heroGradient: "linear-gradient(180deg, #15004E 0%, #825EA6 100%)",
    cardGradient: "linear-gradient(180deg, #1D007B 0%, #6A49D6 100%)",
    summaryTextColor: "#FFFFFF",
    progressColor: "#8F84FF",
    glowColor: "rgba(143, 132, 255, 0.46)"
  }
} as const satisfies Record<TalentLevel, TalentTheme>;

export const promotionAvatarTone = {
  face: "linear-gradient(180deg, #FFE0C9 0%, #FFFFFF 100%)",
  hair: "#1E1E1E",
  eye: "#141414",
  mouth: "#EF8F77"
} as const;

export const promotionIconTones: Record<string, { background: string; foreground: string; mark: string }> = {
  "promotion-gift": { background: "#FFF1F1", foreground: "#FF5D82", mark: "礼" },
  "promotion-rank": { background: "#FFF7EB", foreground: "#F5B51B", mark: "榜" },
  "promotion-tool-product": { background: "#EAFBF3", foreground: "#10B86F", mark: "品" },
  "promotion-tool-guide": { background: "#EEF7FF", foreground: "#66A8F8", mark: "攻" },
  "promotion-tool-analytics": { background: "#FFF0F6", foreground: "#F66AA5", mark: "析" },
  "promotion-tool-card": { background: "#EAFBF3", foreground: "#10B86F", mark: "卡" },
  "benefit-money": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "佣" },
  "benefit-discount": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "折" },
  "benefit-cake": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "礼" },
  "benefit-coupon": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "券" },
  "benefit-gift": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "活" },
  "benefit-agent": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "AI" },
  "benefit-box": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "商" },
  "benefit-bag": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "训" },
  "benefit-ai": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "AI" }
};
