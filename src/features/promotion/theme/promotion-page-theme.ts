import type { ActivityStatus, RankCenterCard } from "../types";

export const activityStatusTone: Record<ActivityStatus, string> = {
  claiming: "bg-price text-text-inverse",
  active: "bg-success-subtle text-success-strong",
  ended: "bg-fill-muted text-text-disabled"
};

export const activityCenterTheme = {
  cardBackground: "#FFF2F2",
  progressFill: "#FF6D6D"
} as const;

export const activityDetailTheme = {
  priceColor: "#FF2D50",
  orderTitleColor: "#94DD42",
  pkTitleColor: "#FFA114",
  heroTitleStroke: "#FFFFFF",
  heroTitleShadow: "0 3px 0 rgba(15, 15, 15, 0.18)",
  badgeBackground: "#FF8083",
  actionTextColor: "#870017",
  actionBackground: "linear-gradient(180deg, #FFFDF4 0%, #FFE59B 48%, #FFBD47 100%)",
  neutralActionBackground: "#FFFFFF",
  progressTrack: "#FFF4E7",
  progressFill: "linear-gradient(90deg, #FFCACA 0%, #FF4747 100%)",
  progressCompleteTrack: "#F7F9FB",
  progressCompleteFill: "#94DD42",
  ruleHeaderBackground: "#FFE1E1",
  titleGradient: "linear-gradient(140deg, #B61515 14%, #0F0F0F 58%)",
  periodBackground: "#FFF7DD",
  periodText: "#FF7D00"
} as const;

export const rewardRecordsTheme = {
  pageBackground: "#F7F9FB",
  summaryBackground: "linear-gradient(180deg, #053836 0%, #202020 100%)",
  summaryGlow: "radial-gradient(circle at 82% 10%, rgba(90, 142, 255, 0.42), transparent 34%)",
  valueGradient: "linear-gradient(90deg, #D4FFA3 0%, #B6FFD4 46%, #97D6FF 100%)",
  actionBackground: "#82FB98",
  dividerColor: "#103942",
  settledIconBackground: "#FF6D6D",
  pendingIconBackground: "linear-gradient(180deg, #46AEFF 0%, #59B6FF 100%)"
} as const;

export const rankCenterCardTone: Record<RankCenterCard["theme"], string> = {
  blue: "linear-gradient(135deg, #E5F2FF 0%, #B9DDFF 100%)",
  gold: "linear-gradient(135deg, #FFF3D4 0%, #FFD48B 100%)",
  pink: "linear-gradient(135deg, #FFEAF2 0%, #FFBAD3 100%)",
  green: "linear-gradient(135deg, #E9FFF4 0%, #B9F1D0 100%)",
  purple: "linear-gradient(135deg, #F1E8FF 0%, #D6BFFF 100%)"
};

export const rankingTheme = {
  heroBackground: "linear-gradient(180deg, #FF725F 0%, #FFB45A 100%)",
  activeText: "#D25F00"
} as const;

export const benefitsTheme = {
  pageBackground: "#160C35",
  contentBackground: "#19103E",
  heroHighlight: "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.22), transparent 36%)",
  levelTextForDarkHero: "#0B007E",
  dividerColor: "#FFF0C9"
} as const;
