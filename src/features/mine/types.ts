import type { LocalAssetKey } from "@/lib/assets";

export type MineMetric = {
  label: string;
  value: string;
  prefix?: string;
};

export type MineOrderEntry = {
  label: string;
  href: string;
  assetKey: LocalAssetKey;
};

export type MineToolEntry = {
  label: string;
  href?: string;
  assetKey: LocalAssetKey;
  navigation?: "new-webview" | "native-page" | "none";
  nativePage?: string;
};

export type MineProfile = {
  nickname: string;
  phone: string;
  levelLabel: string;
  levelCode: string;
  membershipValidUntil: string;
};

export type MineBanner = {
  href?: string;
  assetKey: LocalAssetKey;
  alt: string;
};

export type MinePageData = {
  profile: MineProfile;
  heroBackgroundAssetKey: LocalAssetKey;
  heroRoleAssetKey: LocalAssetKey;
  notificationHref: string;
  notificationAssetKey: LocalAssetKey;
  benefitsHref: string;
  ordersHref: string;
  metrics: MineMetric[];
  orders: MineOrderEntry[];
  banner: MineBanner;
  tools: MineToolEntry[];
};
