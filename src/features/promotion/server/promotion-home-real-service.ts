import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { talentThemes } from "../theme/talent-theme";
import type { PromotionHomeData, PromotionMetric, TalentLevel } from "../types";

type PromotionHomeBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type PromotionHomeServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type DistributionHomeUserInfoDto = {
  cardNo?: string;
  distributionUserId?: number;
  nickName?: string;
  pic?: string;
  state?: number;
  [key: string]: unknown;
};

export type DistributionMyLevelDto = {
  commissionMultiplier?: number;
  currentLevelName?: string;
  currentLevelValue?: number;
  gapGmv?: number;
  gapOrderCount?: number;
  nextLevelName?: string;
  nextLevelValue?: number;
  nextUpgradeGmv?: number;
  nextUpgradeOrderCount?: number;
  [key: string]: unknown;
};

export type DistributionHomeLevelSectionDto = {
  levelIcon?: string;
  levelInfo?: DistributionMyLevelDto;
  [key: string]: unknown;
};

export type DistributionHomeMySalesDto = {
  totalCommission?: number;
  totalOrderAmount?: number;
  totalOrderCount?: number;
  [key: string]: unknown;
};

export type DistributionHomeSalesStatsDto = {
  todayPromotionIncome?: number;
  todayPromotionOrderCount?: number;
  todayShopVisitCount?: number;
  totalPromotionOrderCount?: number;
  totalShopFavoriteCount?: number;
  totalShopVisitCount?: number;
  [key: string]: unknown;
};

export type DistributionHomeOverviewDto = {
  level?: DistributionHomeLevelSectionDto;
  mySales?: DistributionHomeMySalesDto;
  ongoingIncentiveCount?: number;
  salesStats?: DistributionHomeSalesStatsDto;
  userInfo?: DistributionHomeUserInfoDto;
  [key: string]: unknown;
};

export type PromotionHomeBffData = PromotionHomeData & {
  modules: {
    overview: DistributionHomeOverviewDto;
  };
  debugRaw?: {
    overview: PromotionHomeServerResponse<DistributionHomeOverviewDto>;
  };
};

export type FetchPromotionHomeOverviewOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionHomeBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
};

export async function fetchPromotionHomeOverviewData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false,
  javaOssAssetBaseUrl
}: FetchPromotionHomeOverviewOptions): Promise<BackendApiResult<PromotionHomeBffData>> {
  const result = await backendClient.request<PromotionHomeServerResponse<DistributionHomeOverviewDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/p/distribution/home/overview",
    route: "/promotion"
  });
  if (!result.ok) {
    return result;
  }

  const overview = unwrapPromotionHomeData(result.data, result.meta.requestId);
  if (!overview.ok) {
    return overview;
  }

  return {
    ok: true,
    data: createPromotionHomeBffData({
      overview: overview.data,
      raw: includeDebugRaw ? result.data : undefined,
      javaOssAssetBaseUrl
    }),
    meta: result.meta
  };
}

export function createPromotionHomeBffData({
  javaOssAssetBaseUrl,
  overview,
  raw
}: {
  javaOssAssetBaseUrl?: string;
  overview: DistributionHomeOverviewDto;
  raw?: PromotionHomeServerResponse<DistributionHomeOverviewDto>;
}): PromotionHomeBffData {
  const levelInfo = overview.level?.levelInfo;
  const level = normalizeTalentLevelValue(levelInfo?.currentLevelValue);
  const levelName = levelInfo?.currentLevelName?.trim() || defaultLevelNameByLevel[level];
  const progress = mapProgress(levelInfo);

  return {
    ...(raw === undefined ? {} : { debugRaw: { overview: raw } }),
    modules: {
      overview
    },
    profile: {
      avatar: resolveJavaImageUrl(overview.userInfo?.pic, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL),
      level,
      levelName,
      nickname: overview.userInfo?.nickName?.trim() || "喵呜达人",
      progress
    },
    quickEntries: [
      {
        href: "/promotion/activities",
        iconKey: "promotion-gift",
        id: "activities",
        subtitle: `${normalizeNonNegativeInteger(overview.ongoingIncentiveCount, 0)}个进行中`,
        title: "奖励活动"
      },
      {
        href: "/promotion/rank-center",
        iconKey: "promotion-rank",
        id: "rank-center",
        subtitle: "看看谁是第一",
        title: "排行榜"
      }
    ],
    metrics: mapSalesStats(overview.salesStats),
    summary: {
      currency: "CNY",
      totalCommission: normalizeNumber(overview.mySales?.totalCommission),
      totalSalesAmount: normalizeNumber(overview.mySales?.totalOrderAmount)
    },
    theme: talentThemes[level],
    tools: [
      { href: "/promotion/products", iconKey: "promotion-tool-product", id: "products", title: "商品推广" },
      { href: "/promotion/activities", iconKey: "promotion-tool-guide", id: "guide", title: "赚钱攻略" },
      { href: "/promotion/rank-center", iconKey: "promotion-tool-analytics", id: "analytics", title: "访客分析" },
      { href: "/promotion/card", iconKey: "promotion-tool-card", id: "card", title: "推广名片" }
    ]
  };
}

function unwrapPromotionHomeData<T>(response: PromotionHomeServerResponse<T>, requestId: string): BackendApiResult<T> {
  if (response.success === false) {
    const javaCodeMeta = getJavaResponseCodeMeta(response.code);

    return {
      ok: false,
      error: createApiError(mapJavaBusinessCodeToApiErrorCode(response.code), {
        details: {
          code: response.code,
          ...(javaCodeMeta === undefined ? {} : { codeName: javaCodeMeta.name })
        },
        message: response.msg ?? javaCodeMeta?.message,
        requestId
      })
    };
  }

  if (response.data === undefined || response.data === null) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { code: response.code },
        message: response.msg,
        requestId
      })
    };
  }

  return {
    ok: true,
    data: response.data,
    meta: {
      appEnv: "unknown",
      backend: "java",
      h5Version: "unknown",
      requestId,
      route: "/promotion"
    }
  };
}

function mapSalesStats(stats: DistributionHomeSalesStatsDto | undefined): PromotionMetric[] {
  return [
    { id: "todayVisits", label: "今日店铺访问", value: `+${formatCount(stats?.todayShopVisitCount)}` },
    { id: "todayOrders", label: "今日带货订单", value: `+${formatCount(stats?.todayPromotionOrderCount)}` },
    { id: "todayIncome", label: "今日带货收益", value: `¥${formatNumber(stats?.todayPromotionIncome)}` },
    { id: "totalVisits", label: "累计店铺访问", value: formatCount(stats?.totalShopVisitCount) },
    { id: "totalOrders", label: "累计带货订单", value: formatCount(stats?.totalPromotionOrderCount) },
    { id: "totalFavorites", label: "累计店铺收藏", value: formatCount(stats?.totalShopFavoriteCount) }
  ];
}

function mapProgress(levelInfo: DistributionMyLevelDto | undefined): PromotionHomeData["profile"]["progress"] {
  const orderTarget = normalizeOptionalPositiveNumber(levelInfo?.nextUpgradeOrderCount);
  const orderGap = normalizeOptionalNonNegativeNumber(levelInfo?.gapOrderCount);
  if (orderTarget !== undefined) {
    return {
      current: Math.max(0, Math.round(orderTarget - (orderGap ?? 0))),
      target: Math.max(1, Math.round(orderTarget)),
      unit: "growth",
      ...(levelInfo?.nextLevelName ? { nextTip: `距${levelInfo.nextLevelName}还差${Math.round(orderGap ?? 0)}单` } : {})
    };
  }

  const gmvTarget = normalizeOptionalPositiveNumber(levelInfo?.nextUpgradeGmv);
  const gmvGap = normalizeOptionalNonNegativeNumber(levelInfo?.gapGmv);
  if (gmvTarget !== undefined) {
    return {
      current: Math.max(0, Math.round(gmvTarget - (gmvGap ?? 0))),
      target: Math.max(1, Math.round(gmvTarget)),
      unit: "growth",
      ...(levelInfo?.nextLevelName ? { nextTip: `距${levelInfo.nextLevelName}还差¥${formatNumber(gmvGap ?? 0)}` } : {})
    };
  }

  return {
    current: 1,
    target: 1,
    unit: "growth"
  };
}

function normalizeTalentLevelValue(value: unknown): TalentLevel {
  if (value === 2) {
    return "v2";
  }
  if (value === 3) {
    return "v3";
  }
  if (value === 4) {
    return "v4";
  }
  if (value === 5) {
    return "v5";
  }
  return "v1";
}

const defaultLevelNameByLevel: Record<TalentLevel, string> = {
  v1: "新锐达人",
  v2: "白银达人",
  v3: "黄金达人",
  v4: "星钻达人",
  v5: "至尊达人"
};

function resolveJavaImageUrl(value: string | undefined, assetBaseUrl: string | undefined) {
  const imagePath = value?.trim();
  if (!imagePath) {
    return null;
  }
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(imagePath) || imagePath.startsWith("data:")) {
    return imagePath;
  }
  if (!assetBaseUrl?.trim()) {
    return imagePath;
  }
  return `${assetBaseUrl.trim().replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}

function formatCount(value: unknown) {
  return String(normalizeNonNegativeInteger(value, 0));
}

function formatNumber(value: unknown) {
  const normalized = normalizeNumber(value);
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(2);
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeNonNegativeInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

function normalizeOptionalPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function normalizeOptionalNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function createPromotionHomeBffFailure(error: ApiError): BackendApiResult<PromotionHomeBffData> {
  return {
    ok: false,
    error
  };
}
