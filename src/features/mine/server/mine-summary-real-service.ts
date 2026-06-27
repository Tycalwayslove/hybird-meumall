import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { talentBadgeAssetKeyByLevel } from "@/features/promotion/theme/talent-theme";
import type { TalentLevel } from "@/features/promotion/types";
import type { MinePageData } from "../types";

type MineBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type MineServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

type AppBannerVO = {
  imgUrl?: string;
  jumpType?: number;
  jumpValue?: string;
  seq?: number;
  title?: string;
  [key: string]: unknown;
};

export type AppProfileSummaryDto = {
  banners?: AppBannerVO[];
  couponCount?: number;
  walletBalance?: number;
  yearSavedAmount?: number;
  [key: string]: unknown;
};

type DistributionMyLevelDto = {
  currentLevelName?: string;
  currentLevelValue?: number;
  [key: string]: unknown;
};

export type MineSummaryBffData = MinePageData & {
  modules: {
    level?: DistributionMyLevelDto;
    profileSummary: AppProfileSummaryDto;
  };
  debugRaw?: {
    level?: MineServerResponse<DistributionMyLevelDto>;
    profileSummary?: MineServerResponse<AppProfileSummaryDto>;
  };
};

export type FetchMineSummaryOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: MineBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  javaOssAssetBaseUrl?: string;
};

export async function fetchMineSummaryData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false,
  javaOssAssetBaseUrl
}: FetchMineSummaryOptions): Promise<BackendApiResult<MineSummaryBffData>> {
  const profileResult = await backendClient.request<MineServerResponse<AppProfileSummaryDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/p/app/profile/summary",
    route: "/mine"
  });
  if (!profileResult.ok) {
    return profileResult;
  }

  const profileSummary = unwrapMineData(profileResult.data, profileResult.meta.requestId, "/mine");
  if (!profileSummary.ok) {
    return profileSummary;
  }

  const levelResult = await backendClient.request<MineServerResponse<DistributionMyLevelDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/p/daren/level/myLevel",
    route: "/mine"
  });
  if (!levelResult.ok) {
    return levelResult;
  }

  const level = unwrapMineData(levelResult.data, levelResult.meta.requestId, "/mine");
  if (!level.ok) {
    return level;
  }

  return {
    ok: true,
    data: createMineSummaryBffData({
      javaOssAssetBaseUrl,
      level: level.data,
      profileSummary: profileSummary.data,
      rawLevel: includeDebugRaw ? levelResult.data : undefined,
      rawProfileSummary: includeDebugRaw ? profileResult.data : undefined
    }),
    meta: profileResult.meta
  };
}

export function createMineSummaryBffData({
  javaOssAssetBaseUrl,
  level,
  profileSummary,
  rawLevel,
  rawProfileSummary
}: {
  javaOssAssetBaseUrl?: string;
  level?: DistributionMyLevelDto;
  profileSummary: AppProfileSummaryDto;
  rawLevel?: MineServerResponse<DistributionMyLevelDto>;
  rawProfileSummary?: MineServerResponse<AppProfileSummaryDto>;
}): MineSummaryBffData {
  const talentLevel = normalizeTalentLevelValue(level?.currentLevelValue);
  const banner = mapBanner(profileSummary.banners, javaOssAssetBaseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL);

  return {
    ...(rawProfileSummary === undefined && rawLevel === undefined ? {} : {
      debugRaw: {
        ...(rawLevel === undefined ? {} : { level: rawLevel }),
        ...(rawProfileSummary === undefined ? {} : { profileSummary: rawProfileSummary })
      }
    }),
    banner,
    benefitsHref: `/promotion/benefits?level=${talentLevel}`,
    heroBackgroundAssetKey: "mine.hero.background",
    heroRoleAssetKey: "mine.hero.role",
    metrics: [
      { href: "/wallet", label: "钱包余额", prefix: "¥", value: formatNumber(profileSummary.walletBalance) },
      { label: "今年已省", prefix: "¥", value: formatNumber(profileSummary.yearSavedAmount) },
      { href: "/coupons", label: "优惠券", value: formatCount(profileSummary.couponCount) }
    ],
    modules: {
      level,
      profileSummary
    },
    notificationAssetKey: "mine.notification",
    notificationHref: "/messages",
    orders: [
      { assetKey: "mine.order.pendingPayment", href: "/orders?status=pending-payment", label: "待付款" },
      { assetKey: "mine.order.pendingShipment", href: "/orders?status=pending-shipment", label: "待发货" },
      { assetKey: "mine.order.pendingReceipt", href: "/orders?status=pending-receipt", label: "待收货" },
      { assetKey: "mine.order.completed", href: "/orders?status=completed", label: "已完成" },
      { assetKey: "mine.order.refund", href: "/refunds", label: "退货退款" }
    ],
    ordersHref: "/orders",
    profile: {
      levelBadgeAssetKey: talentBadgeAssetKeyByLevel[talentLevel].replace("promotion.talentBadge", "mine.levelBadge") as MinePageData["profile"]["levelBadgeAssetKey"],
      levelCode: talentLevel.toUpperCase(),
      levelLabel: level?.currentLevelName?.trim() || defaultLevelNameByLevel[talentLevel],
      membershipValidUntil: "",
      nickname: "喵呜达人",
      phone: ""
    },
    tools: [
      { assetKey: "mine.tool.footprint", href: "/footprints", label: "我的足迹", navigation: "new-webview" },
      { assetKey: "mine.tool.favorites", href: "/favorites/products", label: "我的收藏", navigation: "new-webview" },
      { assetKey: "mine.tool.address", href: "/address", label: "地址管理", navigation: "new-webview" },
      { assetKey: "mine.tool.settings", label: "设置", nativePage: "settings", navigation: "native-page" },
      { assetKey: "mine.tool.customerService", href: "/consult", label: "客服服务", navigation: "new-webview" },
      { assetKey: "mine.tool.helpCenter", label: "帮助中心", navigation: "none" },
      { assetKey: "mine.tool.messageCenter", href: "/messages", label: "消息中心", navigation: "new-webview" },
      { assetKey: "mine.tool.productService", href: "/orders", label: "商品服务", navigation: "new-webview" }
    ]
  };
}

function unwrapMineData<T>(response: MineServerResponse<T>, requestId: string, route: string): BackendApiResult<T> {
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
      route
    }
  };
}

function mapBanner(banners: AppBannerVO[] | undefined, assetBaseUrl?: string): MineSummaryBffData["banner"] {
  const banner = [...(banners ?? [])].sort((left, right) => (left.seq ?? 0) - (right.seq ?? 0))[0];
  const imageUrl = resolveJavaImageUrl(banner?.imgUrl, assetBaseUrl);
  if (!banner || !imageUrl) {
    return undefined;
  }
  return {
    alt: banner.title?.trim() || "个人中心 Banner",
    imageUrl,
    ...(mapBannerHref(banner) === undefined ? {} : { href: mapBannerHref(banner) })
  };
}

function mapBannerHref(banner: AppBannerVO) {
  if (!banner.jumpValue) {
    return undefined;
  }
  if (banner.jumpValue.startsWith("/")) {
    return banner.jumpValue;
  }
  if (/^https?:\/\//i.test(banner.jumpValue)) {
    return banner.jumpValue;
  }
  return undefined;
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
    return undefined;
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
  return String(normalizeNonNegativeNumber(value));
}

function formatNumber(value: unknown) {
  const normalized = normalizeNonNegativeNumber(value);
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(2);
}

function normalizeNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function createMineSummaryBffFailure(error: ApiError): BackendApiResult<MineSummaryBffData> {
  return {
    ok: false,
    error
  };
}
