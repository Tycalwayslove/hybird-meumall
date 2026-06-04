import type { ActivityStatus, RankCenterCard } from "../types";

export const activityStatusTone: Record<ActivityStatus, string> = {
  claiming: "bg-warning-subtle text-warning-strong",
  active: "bg-success-subtle text-success-strong",
  ended: "bg-fill-muted text-text-disabled"
};

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
