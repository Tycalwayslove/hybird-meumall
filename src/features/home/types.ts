export type HomeEnvironment = "dev" | "staging" | "prod" | (string & {});

export type HomeEvent = {
  type: "h5_route" | "external_url" | "native_bridge" | (string & {});
  target: string;
  params?: Record<string, unknown>;
};

export type HomeCachePolicy = {
  ttlSeconds: number;
  staleWhileRevalidateSeconds?: number;
};

export type HomePerformancePolicy = {
  requestTimeoutMs?: number;
  skeletonMinMs?: number;
  preloadImageCount?: number;
  lcpCandidateModuleId?: string;
  telemetrySampleRate?: number;
};

export type HomeModuleBase = {
  id: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
};

export type BannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  alt?: string;
  event?: HomeEvent;
  trackingId?: string;
  priority?: boolean;
  enabled: boolean;
  sortOrder: number;
};

export type BannerCarouselModule = HomeModuleBase & {
  type: "banner_carousel";
  items: BannerItem[];
};

export type CategoryItem = {
  id: string;
  name: string;
  iconUrl?: string;
  event?: HomeEvent;
  enabled: boolean;
  sortOrder: number;
};

export type CategoryGridModule = HomeModuleBase & {
  type: "category_grid";
  columns: number;
  rows: number;
  items: CategoryItem[];
};

export type ActivityItem = {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  badge?: string;
  startsAt?: string;
  endsAt?: string;
  event?: HomeEvent;
  enabled: boolean;
  sortOrder: number;
};

export type ActivitySectionModule = HomeModuleBase & {
  type: "activity_section";
  title: string;
  displayMode: "card_grid" | "single_card" | (string & {});
  items: ActivityItem[];
};

export type UnknownHomeModule = HomeModuleBase & {
  type: string;
  [key: string]: unknown;
};

export type SupportedHomeModule = BannerCarouselModule | CategoryGridModule | ActivitySectionModule;
export type HomeModule = SupportedHomeModule | UnknownHomeModule;

export type HomeConfig = {
  schemaVersion: "1.0";
  pageId: "home";
  configVersion: string;
  generatedAt: string;
  cache: HomeCachePolicy;
  performance?: HomePerformancePolicy;
  modules: HomeModule[];
};

export type HomeConfigSource = "remote" | "cache" | "default";

export type HomeConfigState = {
  config: HomeConfig;
  source: HomeConfigSource;
};
