import { createApiError } from "@/lib/api/errors";
import type { ApiError } from "@/lib/api/types";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { talentThemes } from "../theme/talent-theme";
import type { PromotionBenefit, PromotionBenefitsData, TalentLevel } from "../types";

type PromotionLevelBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type PromotionLevelServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type DistributionLevelDisplayBenefitDto = {
  benefitDesc?: string;
  benefitName?: string;
  displayBenefitId?: number;
  icon?: string;
  sort?: number;
  [key: string]: unknown;
};

export type DistributionMyLevelDto = {
  commissionMultiplier?: number;
  currentLevelName?: string;
  currentLevelValue?: number;
  darenBenefitItems?: string[];
  displayBenefits?: DistributionLevelDisplayBenefitDto[];
  gapGmv?: number;
  gapOrderCount?: number;
  nextLevelName?: string;
  nextLevelValue?: number;
  nextUpgradeGmv?: number;
  nextUpgradeOrderCount?: number;
  [key: string]: unknown;
};

export type DistributionLevelAppDto = {
  benefitText?: string;
  commissionMultiplier?: number;
  darenBenefitItems?: string[];
  displayBenefits?: DistributionLevelDisplayBenefitDto[];
  expansionRate?: number;
  levelName?: string;
  levelValue?: number;
  upgradeGmv?: number;
  upgradeOrderCount?: number;
  [key: string]: unknown;
};

export type PromotionBenefitsBffData = {
  activeLevel: TalentLevel;
  levels: PromotionBenefitsData[];
  modules: {
    levelList: DistributionLevelAppDto[];
    myLevel: DistributionMyLevelDto;
  };
  debugRaw?: {
    levelList?: PromotionLevelServerResponse<DistributionLevelAppDto[]>;
    myLevel?: PromotionLevelServerResponse<DistributionMyLevelDto>;
  };
};

export type FetchPromotionBenefitsOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionLevelBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
};

export async function fetchPromotionBenefitsData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false
}: FetchPromotionBenefitsOptions): Promise<BackendApiResult<PromotionBenefitsBffData>> {
  const myLevelResult = await backendClient.request<PromotionLevelServerResponse<DistributionMyLevelDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/p/daren/level/myLevel",
    route: "/promotion/benefits"
  });
  if (!myLevelResult.ok) {
    return myLevelResult;
  }

  const myLevel = unwrapPromotionLevelData(myLevelResult.data, myLevelResult.meta.requestId, "/promotion/benefits");
  if (!myLevel.ok) {
    return myLevel;
  }

  const levelListResult = await backendClient.request<PromotionLevelServerResponse<DistributionLevelAppDto[]>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/p/daren/level/list",
    route: "/promotion/benefits"
  });
  if (!levelListResult.ok) {
    return levelListResult;
  }

  const levelList = unwrapPromotionLevelData(levelListResult.data, levelListResult.meta.requestId, "/promotion/benefits");
  if (!levelList.ok) {
    return levelList;
  }

  const bffData = createPromotionBenefitsBffData({
    levelList: levelList.data,
    myLevel: myLevel.data,
    rawLevelList: includeDebugRaw ? levelListResult.data : undefined,
    rawMyLevel: includeDebugRaw ? myLevelResult.data : undefined
  });
  if (!bffData.ok) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "达人等级列表为空",
        requestId: levelListResult.meta.requestId
      })
    };
  }

  return {
    ok: true,
    data: bffData.data,
    meta: myLevelResult.meta
  };
}

export function createPromotionBenefitsBffData({
  levelList,
  myLevel,
  rawLevelList,
  rawMyLevel
}: {
  levelList: DistributionLevelAppDto[];
  myLevel: DistributionMyLevelDto;
  rawLevelList?: PromotionLevelServerResponse<DistributionLevelAppDto[]>;
  rawMyLevel?: PromotionLevelServerResponse<DistributionMyLevelDto>;
}): BackendApiResult<PromotionBenefitsBffData> {
  const levels = [...levelList]
    .map(mapLevelAppToBenefitsData)
    .filter((level): level is PromotionBenefitsData => level !== null)
    .sort((left, right) => levelOrder(left.profile.level) - levelOrder(right.profile.level));

  if (levels.length === 0) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "达人等级列表为空"
      })
    };
  }

  const currentLevel = normalizeTalentLevelValue(myLevel.currentLevelValue);
  const activeLevel = levels.some((level) => level.profile.level === currentLevel) ? currentLevel : levels[0].profile.level;
  const mergedLevels = levels.map((level) =>
    level.profile.level === currentLevel
      ? mergeCurrentLevelData(level, myLevel)
      : level
  );

  return {
    ok: true,
    data: {
      ...(rawLevelList === undefined && rawMyLevel === undefined ? {} : {
        debugRaw: {
          ...(rawLevelList === undefined ? {} : { levelList: rawLevelList }),
          ...(rawMyLevel === undefined ? {} : { myLevel: rawMyLevel })
        }
      }),
      activeLevel,
      levels: mergedLevels,
      modules: {
        levelList,
        myLevel
      }
    },
    meta: {
      appEnv: "unknown",
      backend: "java",
      h5Version: "unknown",
      requestId: "promotion-benefits",
      route: "/promotion/benefits"
    }
  };
}

function mapLevelAppToBenefitsData(level: DistributionLevelAppDto): PromotionBenefitsData | null {
  const talentLevel = normalizeTalentLevelValue(level.levelValue);
  if (level.levelValue === undefined) {
    return null;
  }
  const levelName = level.levelName?.trim() || defaultLevelNameByLevel[talentLevel];
  const title = `${talentLevel.toUpperCase()}${levelName}`;

  return {
    commission: {
      description: `${title}佣金分成`,
      label: formatCommission(level.commissionMultiplier)
    },
    exclusiveBenefits: mapDisplayBenefits(level.displayBenefits, "exclusive", level.darenBenefitItems),
    memberBenefits: mapTextBenefits(level.darenBenefitItems),
    persona: level.benefitText?.trim() || "达人权益以当前等级配置为准",
    profile: {
      avatar: null,
      level: talentLevel,
      levelName,
      nickname: "喵呜达人",
      progress: {
        current: 0,
        target: Math.max(1, Math.round(normalizePositiveNumber(level.upgradeOrderCount) ?? normalizePositiveNumber(level.upgradeGmv) ?? 1)),
        unit: "growth",
        unlockText: buildUnlockText(level)
      }
    },
    theme: talentThemes[talentLevel]
  };
}

function mergeCurrentLevelData(level: PromotionBenefitsData, myLevel: DistributionMyLevelDto): PromotionBenefitsData {
  return {
    ...level,
    commission: {
      ...level.commission,
      label: formatCommission(myLevel.commissionMultiplier) || level.commission.label
    },
    exclusiveBenefits: myLevel.displayBenefits?.length ? mapDisplayBenefits(myLevel.displayBenefits, "current", myLevel.darenBenefitItems) : level.exclusiveBenefits,
    memberBenefits: myLevel.darenBenefitItems?.length ? mapTextBenefits(myLevel.darenBenefitItems) : level.memberBenefits,
    profile: {
      ...level.profile,
      levelName: myLevel.currentLevelName?.trim() || level.profile.levelName,
      progress: mapCurrentProgress(myLevel, level.profile.progress.unlockText)
    }
  };
}

function mapCurrentProgress(myLevel: DistributionMyLevelDto, fallbackUnlockText?: string): PromotionBenefitsData["profile"]["progress"] {
  const orderTarget = normalizePositiveNumber(myLevel.nextUpgradeOrderCount);
  const orderGap = normalizeNonNegativeNumber(myLevel.gapOrderCount);
  if (orderTarget !== undefined) {
    return {
      current: Math.max(0, Math.round(orderTarget - (orderGap ?? 0))),
      nextTip: myLevel.nextLevelName ? `本月再完成${Math.round(orderGap ?? 0)}单即可升级${myLevel.nextLevelName}` : undefined,
      target: Math.max(1, Math.round(orderTarget)),
      unit: "growth",
      unlockText: fallbackUnlockText
    };
  }

  const gmvTarget = normalizePositiveNumber(myLevel.nextUpgradeGmv);
  const gmvGap = normalizeNonNegativeNumber(myLevel.gapGmv);
  if (gmvTarget !== undefined) {
    return {
      current: Math.max(0, Math.round(gmvTarget - (gmvGap ?? 0))),
      nextTip: myLevel.nextLevelName ? `距${myLevel.nextLevelName}还差¥${formatNumber(gmvGap ?? 0)}` : undefined,
      target: Math.max(1, Math.round(gmvTarget)),
      unit: "growth",
      unlockText: fallbackUnlockText
    };
  }

  return {
    current: 1,
    target: 1,
    unit: "growth",
    unlockText: fallbackUnlockText
  };
}

function mapDisplayBenefits(
  benefits: DistributionLevelDisplayBenefitDto[] | undefined,
  prefix: string,
  fallbackTexts: string[] | undefined
): PromotionBenefit[] {
  const mapped = [...(benefits ?? [])]
    .sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
    .filter((benefit) => benefit.benefitName || benefit.benefitDesc)
    .map((benefit, index) => ({
      description: benefit.benefitDesc?.trim() || "等级专属权益",
      iconKey: mapBenefitIcon(index),
      id: `${prefix}-${benefit.displayBenefitId ?? index}`,
      title: benefit.benefitName?.trim() || benefit.benefitDesc?.trim() || "等级权益"
    }));

  return mapped.length > 0 ? mapped : mapTextBenefits(fallbackTexts);
}

function mapTextBenefits(items: string[] | undefined): PromotionBenefit[] {
  return (items ?? [])
    .filter((item) => item.trim())
    .map((item, index) => ({
      description: "达人等级权益",
      iconKey: mapBenefitIcon(index),
      id: `text-${index}`,
      title: item.trim()
    }));
}

function mapBenefitIcon(index: number) {
  const icons = ["benefit-money", "benefit-discount", "benefit-cake", "benefit-coupon", "benefit-gift", "benefit-agent", "benefit-box", "benefit-bag", "benefit-ai"];
  return icons[index % icons.length];
}

function unwrapPromotionLevelData<T>(response: PromotionLevelServerResponse<T>, requestId: string, route: string): BackendApiResult<T> {
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

function levelOrder(level: TalentLevel) {
  return Number(level.slice(1));
}

const defaultLevelNameByLevel: Record<TalentLevel, string> = {
  v1: "新锐达人",
  v2: "白银达人",
  v3: "黄金达人",
  v4: "星钻达人",
  v5: "至尊达人"
};

function buildUnlockText(level: DistributionLevelAppDto) {
  if (level.upgradeOrderCount !== undefined) {
    return `${Math.round(level.upgradeOrderCount)}单可解锁`;
  }
  if (level.upgradeGmv !== undefined) {
    return `¥${formatNumber(level.upgradeGmv)}可解锁`;
  }
  return undefined;
}

function formatCommission(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? `基础 * ${formatNumber(value * 100)}%` : "基础佣金";
}

function formatNumber(value: unknown) {
  const normalized = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(2);
}

function normalizePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function normalizeNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function createPromotionBenefitsBffFailure(error: ApiError): BackendApiResult<PromotionBenefitsBffData> {
  return {
    ok: false,
    error
  };
}
