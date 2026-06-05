import type { LocalAssetKey } from "@/lib/assets";

export type TalentLevel = "v1" | "v2" | "v3" | "v4" | "v5";

export type TalentThemeName = "peach" | "blue" | "gold" | "purple" | "blackPurple";

export type RankingType = "sales" | "amount";

export type RankingPeriod = "day" | "week" | "month";

export type RewardRecordTab = "settled" | "pending";

export type ActivityStatus = "claiming" | "active" | "ended";

export type PromotionProfile = {
  nickname: string;
  avatar: string | null;
  level: TalentLevel;
  levelName: string;
  progress: {
    current: number;
    target: number;
    unit: "growth";
    nextTip?: string;
    unlockText?: string;
  };
};

export type TalentTheme = {
  name: TalentThemeName;
  accentColor: string;
  textOnHero: "dark" | "light";
  badgeAssetKey: LocalAssetKey;
  heroBackgroundAssetKey: LocalAssetKey;
  summaryCardAssetKey: LocalAssetKey;
  heroGradient: string;
  cardGradient: string;
  summaryTextColor: string;
  progressColor: string;
  glowColor: string;
};

export type PromotionEntry = {
  id: string;
  title: string;
  subtitle?: string;
  iconKey: string;
  href: string;
};

export type PromotionMetric = {
  id: string;
  label: string;
  value: string;
};

export type PromotionHomeData = {
  profile: PromotionProfile;
  theme: TalentTheme;
  summary: {
    totalCommission: number;
    totalSalesAmount: number;
    currency: "CNY";
  };
  quickEntries: PromotionEntry[];
  metrics: PromotionMetric[];
  tools: PromotionEntry[];
};

export type PromotionActivity = {
  id: string;
  href: string;
  tag: string;
  iconKind: "order" | "pk";
  title: string;
  status: ActivityStatus;
  statusText?: string;
  description: string;
  periodText: string;
  progressLabel: string;
  progressValue: string;
  progressPercent: number;
};

export type PromotionActivitiesData = {
  activeCount: number;
  rewardRecordHref: string;
  items: PromotionActivity[];
};

export type ActivityDetailSlug = "open-order-july" | "pk-july" | "pk-june";

export type PromotionActivityDetailData = {
  slug: ActivityDetailSlug;
  title: {
    prefix: string;
    highlight: string;
    suffix: string;
    highlightTone: "order" | "pk";
  };
  heroBackgroundAssetKey: LocalAssetKey;
  rewardRecordHref: string;
  badgeText: string;
  statusText: string;
  statusKind: "primary" | "neutral";
  actionHref?: string;
  periodText: string;
  metrics:
    | {
        kind: "single";
        label: string;
        value: string;
      }
    | {
        kind: "split";
        items: Array<{
          label: string;
          value: string;
        }>;
      };
  progress: {
    completedText: string;
    hintText: string;
    percent: number;
    complete?: boolean;
    amountLabels?: string[];
    milestoneLabels: string[];
  };
  rules: {
    description: string;
    columns: [string, string];
    rows: Array<[string, string]>;
  };
};

export type RewardRecordSummary = {
  totalReward: string;
  settledAmount: string;
  pendingAmount: string;
  withdrawHref: string;
};

export type RewardRecordItem = {
  id: string;
  title: string;
  timeText: string;
  amount: string;
  iconTone: "settled" | "pending";
  href: string;
};

export type RewardRecordTabItem = {
  id: RewardRecordTab;
  title: string;
  href: string;
};

export type PromotionRewardRecordsData = {
  activeTab: RewardRecordTab;
  summary: RewardRecordSummary;
  tabs: RewardRecordTabItem[];
  records: RewardRecordItem[];
};

export type RankCenterCard = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  theme: "blue" | "gold" | "pink" | "green" | "purple";
};

export type RankCenterSection = {
  id: "talent" | "team";
  title: string;
  items: RankCenterCard[];
};

export type RankCenterData = {
  sections: RankCenterSection[];
};

export type RankingRow = {
  rank: number;
  name: string;
  avatar: string | null;
  value: string;
  unit: "单" | "元";
};

export type RankingData = {
  rankingType: RankingType;
  activePeriod: RankingPeriod;
  periodText: string;
  tabs: Array<{
    id: RankingType;
    title: string;
    href: string;
  }>;
  rows: RankingRow[];
  currentUser: RankingRow & {
    onList: boolean;
  };
};

export type PromotionBenefit = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
};

export type PromotionBenefitsData = {
  profile: PromotionProfile;
  theme: TalentTheme;
  commission: {
    label: string;
    description: string;
  };
  persona: string;
  exclusiveBenefits: PromotionBenefit[];
  memberBenefits: PromotionBenefit[];
};

export type H5BffResult<T> =
  | { success: true; data: T; requestId: string }
  | {
      success: false;
      code: string;
      message: string;
      requestId?: string;
      recoverable: boolean;
    };
