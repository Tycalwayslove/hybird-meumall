import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { sanitizePromotionRuleContent } from "../rule-content";
import type {
  ActivityStatus,
  PromotionActivitiesData,
  PromotionActivitiesPage,
  PromotionActivityDetailData,
  PromotionActivityRewardData
} from "../types";

type PromotionIncentiveBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type PromotionIncentiveServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type DistributionIncentiveCardPageVO = {
  id?: number;
  title?: string;
  description?: string;
  incentiveType?: number;
  ruleSummary?: string;
  startTime?: string;
  endTime?: string;
  displayState?: number;
  currentProgress?: number;
  saleCount?: number;
  gmv?: number;
  saleRank?: number;
  gmvRank?: number;
  rankThresholdVal?: number;
  targetGroup?: number;
  targetLevels?: DistributionIncentiveTargetLevelVO[];
  sort?: number;
  createTime?: string;
  [key: string]: unknown;
};

export type DistributionIncentivePageVO = {
  records?: DistributionIncentiveCardPageVO[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
  ongoingActivityCount?: number;
  [key: string]: unknown;
};

export type DistributionIncentiveTargetLevelVO = {
  levelId?: number;
  levelName?: string;
  levelValue?: number;
  [key: string]: unknown;
};

export type DistributionIncentiveRewardVO = {
  id?: number;
  thresholdVal?: number;
  rankFrom?: number;
  rankTo?: number;
  description?: string;
  sort?: number;
  prizes?: DistributionIncentivePrizeVO[];
  [key: string]: unknown;
};

export type DistributionIncentivePrizeVO = {
  id?: number;
  prizeName?: string;
  name?: string;
  prizeType?: number;
  cashAmount?: number;
  couponId?: number;
  prizeCount?: number;
  [key: string]: unknown;
};

export type DistributionIncentiveProgressVO = {
  saleCount?: number;
  gmv?: number;
  saleRank?: number;
  gmvRank?: number;
  currentProgress?: number;
  alreadyRewardId?: number;
  alreadyRewardIds?: number[];
  isAwarded?: number;
  [key: string]: unknown;
};

export type DistributionIncentiveAppDetailVO = {
  id?: number;
  title?: string;
  description?: string;
  incentiveType?: number;
  startTime?: string;
  endTime?: string;
  displayState?: number;
  banner?: string;
  ruleContent?: string;
  ruleSummary?: string;
  targetGroup?: number;
  targetLevels?: DistributionIncentiveTargetLevelVO[];
  rewards?: DistributionIncentiveRewardVO[];
  progress?: DistributionIncentiveProgressVO;
  completedDistributorCount?: number;
  createTime?: string;
  [key: string]: unknown;
};

export type DistributionIncentiveAppRewardRecordDetailVO = {
  id?: number;
  prizeName?: string;
  prizeType?: number;
  cashAmount?: number;
  couponId?: number;
  prizeCount?: number;
  deliverType?: number;
  deliverState?: number;
  addrId?: number;
  receiver?: string;
  mobile?: string;
  province?: string;
  city?: string;
  area?: string;
  address?: string;
  receiveTime?: string;
  finishTime?: string;
  createTime?: string;
  [key: string]: unknown;
};

export type DistributionIncentiveAppRewardRecordVO = {
  id?: number;
  incentiveTitle?: string;
  incentiveType?: number;
  rewardId?: number;
  rewardDescription?: string;
  distributionUserId?: number;
  saleCount?: number;
  gmv?: number;
  saleRank?: number;
  gmvRank?: number;
  isAwarded?: number;
  details?: DistributionIncentiveAppRewardRecordDetailVO[];
  [key: string]: unknown;
};

export type PromotionIncentiveActivitiesBffData = PromotionActivitiesData & {
  page: PromotionActivitiesPage;
  modules: {
    activityPage: DistributionIncentivePageVO;
    activities: DistributionIncentiveCardPageVO[];
  };
  debugRaw?: {
    activityPage: PromotionIncentiveServerResponse<DistributionIncentivePageVO>;
  };
};

export type PromotionIncentiveActivityDetailBffData = PromotionActivityDetailData & {
  modules: {
    detail: DistributionIncentiveAppDetailVO;
    reward?: DistributionIncentiveAppRewardRecordVO;
  };
  debugRaw?: {
    detail?: PromotionIncentiveServerResponse<DistributionIncentiveAppDetailVO>;
    reward?: PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>;
  };
};

export type PromotionIncentiveRewardDetailBffData = {
  view: PromotionActivityRewardData | null;
  reward: DistributionIncentiveAppRewardRecordVO | null;
  modules: {
    reward: DistributionIncentiveAppRewardRecordVO | null;
  };
  debugRaw?: {
    reward: PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>;
  };
};

export type FetchPromotionIncentiveActivitiesOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionIncentiveBackendClient;
  clientContext?: ClientRequestContext;
  current?: number;
  displayStates?: number[];
  includeDebugRaw?: boolean;
  orderBy?: string | null;
  size?: number;
};

export type FetchPromotionIncentiveActivityDetailOptions = {
  activityId: string;
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionIncentiveBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
};

export type ReceivePromotionIncentiveRewardOptions = {
  addressId?: number;
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionIncentiveBackendClient;
  clientContext?: ClientRequestContext;
  recordId: string;
};

export async function fetchPromotionIncentiveActivitiesData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  current = 1,
  displayStates,
  includeDebugRaw = false,
  orderBy,
  size = 10
}: FetchPromotionIncentiveActivitiesOptions): Promise<BackendApiResult<PromotionIncentiveActivitiesBffData>> {
  const page = normalizePageParams({ current, size });
  const query = new URLSearchParams({
    current: String(page.current),
    size: String(page.size)
  });
  appendOptionalParam(query, "orderBy", orderBy);
  appendArrayParam(query, "displayStates", displayStates);

  const result = await backendClient.request<PromotionIncentiveServerResponse<DistributionIncentivePageVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/app/distribution/incentive/page?${query.toString()}`,
    route: "/promotion/activities"
  });
  if (!result.ok) {
    return result;
  }

  const activityPage = unwrapPromotionIncentiveData(result.data, result.meta.requestId, "/promotion/activities");
  if (!activityPage.ok) {
    return activityPage;
  }

  return {
    ok: true,
    data: createPromotionIncentiveActivitiesBffData({
      page,
      pagedActivities: activityPage.data,
      raw: includeDebugRaw ? result.data : undefined
    }),
    meta: result.meta
  };
}

export async function fetchPromotionIncentiveActivityDetailData({
  activityId,
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false
}: FetchPromotionIncentiveActivityDetailOptions): Promise<BackendApiResult<PromotionIncentiveActivityDetailBffData>> {
  const normalizedActivityId = normalizeIdParam(activityId);
  if (!normalizedActivityId) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "Invalid promotion incentive activity id."
      })
    };
  }

  const detailResult = await backendClient.request<PromotionIncentiveServerResponse<DistributionIncentiveAppDetailVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/app/distribution/incentive/detail/${normalizedActivityId}`,
    route: `/promotion/activities/${normalizedActivityId}`
  });
  if (!detailResult.ok) {
    return detailResult;
  }

  const detail = unwrapPromotionIncentiveData(detailResult.data, detailResult.meta.requestId, "/promotion/activities/detail");
  if (!detail.ok) {
    return detail;
  }

  return {
    ok: true,
    data: createPromotionIncentiveActivityDetailBffData({
      detail: detail.data,
      rawDetail: includeDebugRaw ? detailResult.data : undefined
    }),
    meta: detailResult.meta
  };
}

export async function fetchPromotionIncentiveRewardDetailData({
  activityId,
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false
}: FetchPromotionIncentiveActivityDetailOptions): Promise<BackendApiResult<PromotionIncentiveRewardDetailBffData>> {
  const normalizedActivityId = normalizeIdParam(activityId);
  if (!normalizedActivityId) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "Invalid promotion incentive activity id."
      })
    };
  }

  const rewardResult = await backendClient.request<PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/app/distribution/incentive/reward/detail/${normalizedActivityId}`,
    route: `/promotion/activities/${normalizedActivityId}/reward`
  });
  if (!rewardResult.ok) {
    return rewardResult;
  }

  const reward = unwrapOptionalPromotionIncentiveData(rewardResult.data, rewardResult.meta.requestId, "/promotion/activities/reward");
  if (!reward.ok) {
    return reward;
  }

  return {
    ok: true,
    data: createPromotionIncentiveRewardDetailBffData({
      rawReward: includeDebugRaw ? rewardResult.data : undefined,
      reward: reward.data
    }),
    meta: rewardResult.meta
  };
}

export async function receivePromotionIncentiveReward({
  addressId,
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  recordId
}: ReceivePromotionIncentiveRewardOptions): Promise<BackendApiResult<{ received: true }>> {
  const normalizedRecordId = normalizeIdParam(recordId);
  if (!normalizedRecordId) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "Invalid promotion incentive reward record id."
      })
    };
  }

  const result = await backendClient.request<PromotionIncentiveServerResponse<null>>({
    authRequired,
    authToken,
    backend: "java",
    body: addressId === undefined ? {} : { addressId },
    clientContext,
    method: "PATCH",
    path: `/p/app/distribution/incentive/reward/receive/${normalizedRecordId}`,
    route: "/promotion/activities/reward/receive"
  });
  if (!result.ok) {
    return result;
  }

  const unwrapped = unwrapNullablePromotionIncentiveData(result.data, result.meta.requestId, "/promotion/activities/reward/receive");
  if (!unwrapped.ok) {
    return unwrapped;
  }

  return {
    ok: true,
    data: { received: true },
    meta: result.meta
  };
}

export function createPromotionIncentiveActivitiesBffData({
  page,
  pagedActivities,
  raw
}: {
  page: { current: number; size: number };
  pagedActivities: DistributionIncentivePageVO;
  raw?: PromotionIncentiveServerResponse<DistributionIncentivePageVO>;
}): PromotionIncentiveActivitiesBffData {
  const activities = (pagedActivities.records ?? []).filter((activity) => activity.id !== undefined);
  const current = normalizePositiveInteger(pagedActivities.current, page.current);
  const size = normalizePositiveInteger(pagedActivities.size, page.size);
  const total = normalizeOptionalNonNegativeInteger(pagedActivities.total);
  const pages = normalizeOptionalNonNegativeInteger(pagedActivities.pages);

  return {
    ...(raw === undefined ? {} : { debugRaw: { activityPage: raw } }),
    activeCount: normalizeOptionalNonNegativeInteger(pagedActivities.ongoingActivityCount) ?? activities.filter((activity) => [1, 2, 3, 4].includes(activity.displayState ?? -1)).length,
    items: activities.map(mapActivityCard),
    modules: {
      activities,
      activityPage: pagedActivities
    },
    page: {
      current,
      hasMore: hasMorePages({ current, pages, recordCount: pagedActivities.records?.length ?? 0, size, total }),
      ...(pages === undefined ? {} : { pages }),
      size,
      ...(total === undefined ? {} : { total })
    },
    rewardRecordHref: "/promotion/activities/reward-records"
  };
}

export function createPromotionIncentiveActivityDetailBffData({
  detail,
  rawDetail,
  rawReward,
  reward
}: {
  detail: DistributionIncentiveAppDetailVO;
  rawDetail?: PromotionIncentiveServerResponse<DistributionIncentiveAppDetailVO>;
  rawReward?: PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>;
  reward?: DistributionIncentiveAppRewardRecordVO;
}): PromotionIncentiveActivityDetailBffData {
  const incentiveType = normalizeIncentiveType(detail.incentiveType);
  const action = buildDetailAction(detail.displayState);
  const titleParts = splitActivityTitle(detail.title, incentiveType);
  const rewardItems = mapRewardItems(detail.rewards, reward);

  return {
    ...(rawDetail === undefined && rawReward === undefined ? {} : {
      debugRaw: {
        ...(rawDetail === undefined ? {} : { detail: rawDetail }),
        ...(rawReward === undefined ? {} : { reward: rawReward })
      }
    }),
    ...(action.href === undefined ? {} : { actionHref: action.href.replace(":activityId", String(detail.id ?? "")) }),
    actionVisible: action.visible,
    badgeText: buildBadgeText(detail, incentiveType),
    bannerUrl: normalizeImageUrl(detail.banner),
    canReceiveReward: rewardItems.some((item) => item.canReceive),
    heroBackgroundAssetKey: incentiveType === 1 || incentiveType === 2 ? "promotion.activityDetailHero.order" : "promotion.activityDetailHero.pk",
    id: String(detail.id ?? ""),
    metrics: buildDetailMetrics(detail, reward, incentiveType),
    modules: {
      detail,
      ...(reward === undefined ? {} : { reward })
    },
    periodText: buildPeriodText(detail.startTime, detail.endTime),
    progress: buildDetailProgress(detail, incentiveType),
    rewardRecordHref: "/promotion/activities/reward-records",
    ruleContentHtml: sanitizePromotionRuleContent(optionalText(detail.ruleContent)),
    ruleHref: `/promotion/activities/${detail.id ?? ""}/rules`,
    rewards: rewardItems,
    rules: buildDetailRules(detail, incentiveType),
    statusKind: action.kind,
    statusText: action.text,
    title: {
      ...titleParts,
      highlightTone: incentiveType === 1 || incentiveType === 2 ? "order" : "pk"
    }
  };
}

export function createPromotionIncentiveRewardDetailBffData({
  rawReward,
  reward
}: {
  rawReward?: PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>;
  reward?: DistributionIncentiveAppRewardRecordVO;
}): PromotionIncentiveRewardDetailBffData {
  const normalizedReward = reward ?? null;

  return {
    ...(rawReward === undefined ? {} : { debugRaw: { reward: rawReward } }),
    modules: {
      reward: normalizedReward
    },
    reward: normalizedReward,
    view: normalizedReward ? mapRewardDetailView(normalizedReward) : null
  };
}

function mapRewardDetailView(reward: DistributionIncentiveAppRewardRecordVO): PromotionActivityRewardData {
  const activityTitle = optionalText(reward.incentiveTitle) || "激励活动";

  return {
    activityId: String(reward.id ?? ""),
    activityTitle,
    completion: buildRewardCompletion(reward, activityTitle),
    rewards: asArray(reward.details).map(mapRewardDetailItem)
  };
}

function buildRewardCompletion(
  reward: DistributionIncentiveAppRewardRecordVO,
  activityTitle: string
): PromotionActivityRewardData["completion"] {
  const incentiveType = normalizeIncentiveType(reward.incentiveType);
  const fallbackDescription = optionalText(reward.rewardDescription);
  const activityLine = `您在"${activityTitle}"活动中`;

  if (incentiveType === 1) {
    const value = normalizeOptionalNonNegativeInteger(reward.saleCount);
    return {
      activityLine,
      actionText: "成功完成销量",
      ...(value === undefined ? { valueText: fallbackDescription } : { valueText: `${formatAmount(value)}单` })
    };
  }

  if (incentiveType === 2) {
    const value = normalizeOptionalNonNegativeNumber(reward.gmv);
    return {
      activityLine,
      actionText: "成功完成销售额",
      ...(value === undefined ? { valueText: fallbackDescription } : { valueText: formatAmount(value) })
    };
  }

  if (incentiveType === 3) {
    const rank = normalizeOptionalNonNegativeInteger(reward.saleRank);
    return {
      activityLine,
      actionText: "成功完成销量排名",
      ...(rank === undefined || rank === 0 ? { valueText: fallbackDescription } : { valueText: `第${rank}名` })
    };
  }

  const rank = normalizeOptionalNonNegativeInteger(reward.gmvRank);
  return {
    activityLine,
    actionText: "成功完成销售额排名",
    ...(rank === undefined || rank === 0 ? { valueText: fallbackDescription } : { valueText: `第${rank}名` })
  };
}

function mapRewardDetailItem(detail: DistributionIncentiveAppRewardRecordDetailVO): PromotionActivityRewardData["rewards"][number] {
  const statusKind = rewardDetailStatusKind(detail.deliverState);
  const addressText = buildRewardAddressText(detail);

  return {
    ...(detail.addrId === undefined ? {} : { addressId: detail.addrId }),
    ...(addressText === undefined ? {} : { addressText }),
    actionText: statusKind === "ready" ? "领取" : "查看",
    canReceive: statusKind === "ready",
    description: rewardDetailDescription(detail),
    ...(detail.deliverType === undefined ? {} : { deliverType: detail.deliverType }),
    id: String(detail.id ?? detail.prizeName ?? ""),
    ...(detail.prizeType === undefined ? {} : { prizeType: detail.prizeType }),
    statusKind,
    ...(statusKind === "ready" ? {} : { statusText: deliverStateText(detail.deliverState) }),
    title: rewardDetailTitle(detail)
  };
}

function rewardDetailStatusKind(deliverState: number | undefined): PromotionActivityRewardData["rewards"][number]["statusKind"] {
  if (deliverState === 0) {
    return "ready";
  }
  if (deliverState === 2) {
    return "done";
  }
  return "pending";
}

function rewardDetailTitle(detail: DistributionIncentiveAppRewardRecordDetailVO) {
  const name = optionalText(detail.prizeName) || prizeTypeText(detail.prizeType);
  if (detail.prizeType === 1 && detail.cashAmount !== undefined) {
    return `${name}+${formatAmount(detail.cashAmount)}`;
  }

  const count = normalizeOptionalNonNegativeInteger(detail.prizeCount);
  if (count === undefined || count <= 1 || /\d/.test(name)) {
    return name;
  }

  return `${name}${count}${prizeCountUnit(detail.prizeType)}`;
}

function prizeCountUnit(prizeType: number | undefined) {
  if (prizeType === 2) {
    return "张";
  }
  if (prizeType === 3) {
    return "件";
  }
  return "份";
}

function rewardDetailDescription(detail: DistributionIncentiveAppRewardRecordDetailVO) {
  if (detail.prizeType === 1) {
    return "现金奖励将直接发放到您的钱包";
  }
  if (detail.prizeType === 2) {
    return "优惠券奖励将发放到您的账户";
  }
  if (detail.prizeType === 3) {
    return detail.deliverType === 2 ? "实物奖励将按照填写地址发放" : "将在公司现场发放";
  }
  return undefined;
}

function buildRewardAddressText(detail: DistributionIncentiveAppRewardRecordDetailVO) {
  const areaText = [detail.province, detail.city, detail.area, detail.address]
    .map(optionalText)
    .filter(Boolean)
    .join("");
  const contactText = [detail.receiver, detail.mobile]
    .map(optionalText)
    .filter(Boolean)
    .join(" ");

  if (!areaText && !contactText) {
    return undefined;
  }

  return [areaText, contactText].filter(Boolean).join("；");
}

function unwrapPromotionIncentiveData<T>(
  response: PromotionIncentiveServerResponse<T>,
  requestId: string,
  route: string
): BackendApiResult<T> {
  if (response.success === false) {
    return createJavaBusinessError(response, requestId);
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

  return createOkResult(response.data, requestId, route);
}

function unwrapOptionalPromotionIncentiveData<T>(
  response: PromotionIncentiveServerResponse<T>,
  requestId: string,
  route: string
): BackendApiResult<T | undefined> {
  if (response.success === false) {
    return createJavaBusinessError(response, requestId);
  }
  return createOkResult(response.data ?? undefined, requestId, route);
}

function unwrapNullablePromotionIncentiveData(
  response: PromotionIncentiveServerResponse<null>,
  requestId: string,
  route: string
): BackendApiResult<null> {
  if (response.success === false) {
    return createJavaBusinessError(response, requestId);
  }
  return createOkResult(null, requestId, route);
}

function createJavaBusinessError<T>(response: PromotionIncentiveServerResponse<T>, requestId: string): BackendApiResult<T> {
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

function createOkResult<T>(data: T, requestId: string, route: string): BackendApiResult<T> {
  return {
    ok: true,
    data,
    meta: {
      appEnv: "unknown",
      backend: "java",
      h5Version: "unknown",
      requestId,
      route
    }
  };
}

function mapActivityCard(activity: DistributionIncentiveCardPageVO) {
  const incentiveType = normalizeIncentiveType(activity.incentiveType);
  const status = mapActivityStatus(activity.displayState);
  const progress = normalizePercent(activity.currentProgress);
  const progressInfo = buildCardProgress(activity, incentiveType);

  return {
    description: optionalText(activity.description) || optionalText(activity.ruleSummary) || incentiveTypeText(incentiveType),
    href: `/promotion/activities/${activity.id}`,
    iconKind: incentiveType === 1 || incentiveType === 2 ? "order" as const : "pk" as const,
    id: String(activity.id ?? ""),
    periodText: buildPeriodText(activity.startTime, activity.endTime),
    progressLabel: progressInfo.label,
    progressPercent: progressInfo.percent ?? progress,
    progressValue: progressInfo.value,
    status,
    statusText: cardStatusText(activity.displayState),
    tag: incentiveTypeText(incentiveType),
    title: optionalText(activity.title) || incentiveTypeText(incentiveType)
  };
}

function buildCardProgress(activity: DistributionIncentiveCardPageVO, incentiveType: number) {
  if (incentiveType === 1) {
    return {
      label: "目前进度:",
      percent: normalizePercent(activity.currentProgress),
      value: `${normalizePercent(activity.currentProgress)}%`
    };
  }
  if (incentiveType === 2) {
    return {
      label: "目前进度:",
      percent: normalizePercent(activity.currentProgress),
      value: `${normalizePercent(activity.currentProgress)}%`
    };
  }
  if (incentiveType === 3) {
    const threshold = normalizeOptionalNonNegativeInteger(activity.rankThresholdVal);
    const rank = normalizeOptionalNonNegativeInteger(activity.saleRank);
    return {
      label: "目前排名:",
      percent: buildRankProgress(rank, threshold),
      value: rank === undefined ? "--" : String(rank)
    };
  }
  const threshold = normalizeOptionalNonNegativeInteger(activity.rankThresholdVal);
  const rank = normalizeOptionalNonNegativeInteger(activity.gmvRank);
  return {
    label: "目前排名:",
    percent: buildRankProgress(rank, threshold),
    value: rank === undefined ? "--" : String(rank)
  };
}

function buildDetailMetrics(
  detail: DistributionIncentiveAppDetailVO,
  reward: DistributionIncentiveAppRewardRecordVO | undefined,
  incentiveType: number
): PromotionActivityDetailData["metrics"] {
  if (incentiveType === 1) {
    return {
      kind: "single",
      label: "累计销量",
      value: String(detail.progress?.saleCount ?? reward?.saleCount ?? 0)
    };
  }
  if (incentiveType === 2) {
    return {
      kind: "single",
      label: "累计销售额",
      value: formatAmount(detail.progress?.gmv ?? reward?.gmv)
    };
  }
  if (incentiveType === 3) {
    return {
      kind: "split",
      items: [
        { label: "当前排名", value: rankText(detail.progress?.saleRank ?? reward?.saleRank) },
        { label: "累计销量", value: String(detail.progress?.saleCount ?? reward?.saleCount ?? 0) }
      ]
    };
  }
  return {
    kind: "split",
    items: [
      { label: "当前排名", value: rankText(detail.progress?.gmvRank ?? reward?.gmvRank) },
      { label: "销售额", value: formatAmount(detail.progress?.gmv ?? reward?.gmv) }
    ]
  };
}

function buildDetailProgress(detail: DistributionIncentiveAppDetailVO, incentiveType: number): PromotionActivityDetailData["progress"] {
  const rewards = sortRewards(detail.rewards);
  const completedCount = normalizeOptionalNonNegativeInteger(detail.completedDistributorCount);
  const completedText = completedCount === undefined ? "当前活动进度统计中" : `当前活动已有${completedCount}人完成`;
  const percent = normalizePercent(detail.progress?.currentProgress);
  const amountLabels = incentiveType === 1 || incentiveType === 2 ? buildRewardAmountLabels(rewards) : undefined;

  return {
    amountLabels,
    complete: percent >= 100,
    completedText: incentiveType === 1 || incentiveType === 2 ? completedText : undefined,
    hintText: buildProgressHint(detail, incentiveType),
    milestoneLabels: buildProgressMilestoneLabels(rewards, incentiveType),
    percent
  };
}

function buildDetailRules(detail: DistributionIncentiveAppDetailVO, incentiveType: number): PromotionActivityDetailData["rules"] {
  const rewards = sortRewards(detail.rewards);
  const rows = rewards.flatMap((reward) => {
    const prizeText = rewardPrizeText(reward.prizes);
    return [[rewardMilestoneLabel(reward, incentiveType), prizeText || reward.description || "奖励待公布"] as [string, string]];
  });

  return {
    columns: incentiveType === 1 || incentiveType === 2 ? ["达标条件", "奖励"] : ["排名区间", "奖励"],
    description: stripHtml(optionalText(detail.ruleContent)) || "活动规则以页面展示和后端结算结果为准",
    rows: rows.length > 0 ? rows : [["活动规则", "奖励待公布"]]
  };
}

function mapRewardItems(
  rewards: DistributionIncentiveRewardVO[] | undefined,
  rewardRecord: DistributionIncentiveAppRewardRecordVO | undefined
): NonNullable<PromotionActivityDetailData["rewards"]> {
  if (rewardRecord === undefined) {
    return [];
  }

  const recordDetails = asArray(rewardRecord?.details);
  return sortRewards(rewards).map((reward) => {
    const fallbackDetails = String(rewardRecord?.rewardId ?? "") === String(reward.id ?? "") ? recordDetails : [];
    const canReceive = fallbackDetails.some((detail) => detail.deliverState === 0);
    const receiveDetail = fallbackDetails.find((detail) => detail.deliverState === 0);

    return {
      canReceive,
      id: String(reward.id ?? reward.sort ?? reward.description ?? ""),
      prizes: fallbackDetails.map((detail) => ({
        id: String(detail.id ?? detail.prizeName ?? ""),
        name: detail.prizeName?.trim() || "奖励",
        stateText: deliverStateText(detail.deliverState),
        typeText: prizeTypeText(detail.prizeType)
      })),
      receiveRecordId: receiveDetail?.id === undefined ? undefined : String(receiveDetail.id),
      statusText: canReceive ? "待领取" : rewardRecord?.isAwarded === 1 ? "已获奖" : "未达标",
      title: optionalText(reward.description) || rewardMilestoneLabel(reward, normalizeIncentiveType(rewardRecord?.incentiveType))
    };
  });
}

function buildDetailAction(displayState: number | undefined): {
  href?: string;
  kind: PromotionActivityDetailData["statusKind"];
  text: string;
  visible: boolean;
} {
  switch (displayState) {
    case 2:
      return {
        href: "/promotion/products?incentiveId=:activityId",
        kind: "primary",
        text: "去带货",
        visible: true
      };
    case 4:
      return {
        href: "/promotion/activities/:activityId/reward?mode=receive",
        kind: "primary",
        text: "去领奖",
        visible: true
      };
    case 5:
      return {
        href: "/promotion/activities/:activityId/reward?mode=view",
        kind: "primary",
        text: "查看奖励",
        visible: true
      };
    default:
      return {
        kind: "neutral",
        text: "",
        visible: false
      };
  }
}

function splitActivityTitle(title: string | undefined, incentiveType: number) {
  const fallbackHighlight = incentiveType === 1 ? "销量" : incentiveType === 2 ? "销售额" : "PK";
  const value = optionalText(title);
  if (!value) {
    return {
      prefix: "",
      highlight: fallbackHighlight,
      suffix: "有礼"
    };
  }

  const highlight = value.includes("GMV") ? "GMV" : value.includes("PK") ? "PK" : value.includes("销量") ? "销量" : fallbackHighlight;
  const index = value.indexOf(highlight);
  if (index < 0) {
    return {
      prefix: "",
      highlight,
      suffix: value
    };
  }

  return {
    prefix: value.slice(0, index),
    highlight,
    suffix: value.slice(index + highlight.length)
  };
}

function buildBadgeText(detail: DistributionIncentiveAppDetailVO, incentiveType: number) {
  const ruleSummary = optionalText(detail.ruleSummary);
  if (ruleSummary) {
    return ruleSummary;
  }
  if (incentiveType === 1) {
    return "销量达标可获激励";
  }
  if (incentiveType === 2) {
    return "销售额达标可获激励";
  }
  return "排名达标可获激励";
}

function buildProgressHint(detail: DistributionIncentiveAppDetailVO, incentiveType: number) {
  const rewards = sortRewards(detail.rewards);
  if (incentiveType === 1 || incentiveType === 2) {
    return buildThresholdProgressHint(detail, rewards, incentiveType);
  }
  return buildRankProgressHint(detail, rewards, incentiveType);
}

function buildThresholdProgressHint(
  detail: DistributionIncentiveAppDetailVO,
  rewards: DistributionIncentiveRewardVO[],
  incentiveType: number
) {
  const progress = detail.progress;
  const currentValue = normalizeNonNegativeNumber(incentiveType === 1 ? progress?.saleCount : progress?.gmv);
  const alreadyRewardIds = collectAlreadyRewardIds(progress);
  const achievedReward = findLastAchievedReward(rewards, alreadyRewardIds);
  const nextReward = rewards.find((reward) => {
    if (alreadyRewardIds.has(String(reward.id ?? ""))) {
      return false;
    }
    const threshold = normalizeOptionalNonNegativeNumber(reward.thresholdVal);
    return threshold === undefined || currentValue < threshold;
  });

  if (!nextReward) {
    return buildAwardedHint(progress, achievedReward) || "您已完成当前活动目标，请关注奖励发放状态";
  }

  const nextThreshold = normalizeOptionalNonNegativeNumber(nextReward.thresholdVal);
  const remaining = nextThreshold === undefined ? undefined : Math.max(0, nextThreshold - currentValue);
  const unit = incentiveType === 1 ? "单" : "销售额";
  const nextPrize = rewardNextPrizeText(nextReward);
  const achievedText = achievedReward ? `您已获得${rewardAchievedPrizeText(achievedReward)}，` : "";
  const remainingText = remaining === undefined ? `完成${rewardMilestoneLabel(nextReward, incentiveType)}` : `再完成${formatAmount(remaining)}${unit}`;

  return `${achievedText}${remainingText}可获得${nextPrize}`;
}

function buildRankProgressHint(
  detail: DistributionIncentiveAppDetailVO,
  rewards: DistributionIncentiveRewardVO[],
  incentiveType: number
) {
  const progress = detail.progress;
  const rank = normalizeOptionalNonNegativeInteger(currentRank(progress, incentiveType));
  const alreadyRewardIds = collectAlreadyRewardIds(progress);
  const achievedReward = findLastAchievedReward(rewards, alreadyRewardIds) ?? findReachedRankReward(rewards, rank);
  const nextReward = rewards.find((reward) => {
    if (alreadyRewardIds.has(String(reward.id ?? ""))) {
      return false;
    }
    const targetRank = rewardRankTarget(reward);
    return targetRank === undefined || rank === undefined || rank === 0 || rank > targetRank;
  });

  if (!nextReward) {
    return buildAwardedHint(progress, achievedReward) || "您已进入目标排名，请关注结算结果";
  }

  const targetRank = rewardRankTarget(nextReward);
  const targetText = progressRankLabel(nextReward);
  const nextPrize = rewardNextPrizeText(nextReward);
  const achievedText = achievedReward ? `您已进入${progressRankLabel(achievedReward)}，` : "";

  if (rank === undefined || rank === 0 || targetRank === undefined) {
    return `${achievedText}进入${targetText}可获得${nextPrize}`;
  }

  return `${achievedText}再提升${Math.max(0, rank - targetRank)}名可进入${targetText}，可获得${nextPrize}`;
}

function rewardMilestoneLabel(reward: DistributionIncentiveRewardVO, incentiveType: number) {
  if (incentiveType === 1) {
    return `${formatAmount(reward.thresholdVal)}单`;
  }
  if (incentiveType === 2) {
    return `${formatAmount(reward.thresholdVal)}元`;
  }
  if (reward.rankFrom !== undefined && reward.rankTo !== undefined) {
    return reward.rankFrom === reward.rankTo ? `第${reward.rankFrom}名` : `第${reward.rankFrom}-${reward.rankTo}名`;
  }
  return optionalText(reward.description) || "排名达标";
}

function buildProgressMilestoneLabels(rewards: DistributionIncentiveRewardVO[], incentiveType: number) {
  if (rewards.length === 0) {
    return defaultMilestoneLabels(incentiveType);
  }
  if (incentiveType === 1) {
    return ["0单", ...rewards.map((reward) => rewardMilestoneLabel(reward, incentiveType))];
  }
  if (incentiveType === 2) {
    return ["0元", ...rewards.map((reward) => rewardMilestoneLabel(reward, incentiveType))];
  }
  return rewards.map(progressRankLabel);
}

function buildRewardAmountLabels(rewards: DistributionIncentiveRewardVO[]) {
  if (rewards.length === 0) {
    return undefined;
  }
  return ["0元", ...rewards.map((reward) => rewardAmountLabel(reward))];
}

function rewardAmountLabel(reward: DistributionIncentiveRewardVO) {
  const cashPrize = asArray(reward.prizes).find((prize) => prize.prizeType === 1 && prize.cashAmount !== undefined);
  if (cashPrize?.cashAmount !== undefined) {
    return `${formatAmount(cashPrize.cashAmount)}元`;
  }
  return rewardPrizeText(reward.prizes) || "奖励";
}

function rewardAchievedPrizeText(reward: DistributionIncentiveRewardVO) {
  const cashPrize = asArray(reward.prizes).find((prize) => prize.prizeType === 1 && prize.cashAmount !== undefined);
  if (cashPrize?.cashAmount !== undefined) {
    return `${formatAmount(cashPrize.cashAmount)}元激励金`;
  }
  return rewardPrizeText(reward.prizes) || "奖励";
}

function rewardNextPrizeText(reward: DistributionIncentiveRewardVO) {
  const cashPrize = asArray(reward.prizes).find((prize) => prize.prizeType === 1 && prize.cashAmount !== undefined);
  if (cashPrize?.cashAmount !== undefined) {
    return `${formatAmount(cashPrize.cashAmount)}元奖励`;
  }
  return rewardPrizeText(reward.prizes) || "奖励";
}

function collectAlreadyRewardIds(progress: DistributionIncentiveProgressVO | undefined) {
  const ids = new Set<string>();
  if (progress?.alreadyRewardId !== undefined) {
    ids.add(String(progress.alreadyRewardId));
  }
  asArray(progress?.alreadyRewardIds).forEach((id) => ids.add(String(id)));
  return ids;
}

function findLastAchievedReward(rewards: DistributionIncentiveRewardVO[], alreadyRewardIds: Set<string>) {
  return [...rewards].reverse().find((reward) => alreadyRewardIds.has(String(reward.id ?? "")));
}

function findReachedRankReward(rewards: DistributionIncentiveRewardVO[], rank: number | undefined) {
  if (rank === undefined || rank === 0) {
    return undefined;
  }
  return [...rewards].reverse().find((reward) => {
    const targetRank = rewardRankTarget(reward);
    return targetRank !== undefined && rank <= targetRank;
  });
}

function buildAwardedHint(progress: DistributionIncentiveProgressVO | undefined, reward: DistributionIncentiveRewardVO | undefined) {
  if (progress?.isAwarded === 1 && reward) {
    return `您已获得${rewardAchievedPrizeText(reward)}，请关注奖励发放状态`;
  }
  return undefined;
}

function rewardRankTarget(reward: DistributionIncentiveRewardVO) {
  return normalizeOptionalNonNegativeInteger(reward.rankTo ?? reward.rankFrom);
}

function progressRankLabel(reward: DistributionIncentiveRewardVO) {
  const targetRank = rewardRankTarget(reward);
  if (targetRank !== undefined && targetRank > 0) {
    return `TOP${targetRank}`;
  }
  return optionalText(reward.description) || "目标排名";
}

function rewardPrizeText(prizes: DistributionIncentivePrizeVO[] | undefined) {
  return asArray(prizes)
    .map((prize) => {
      const name = prize.prizeName?.trim() || prize.name?.trim() || prizeTypeText(prize.prizeType);
      const count = normalizeOptionalNonNegativeInteger(prize.prizeCount);
      if (prize.prizeType === 1 && prize.cashAmount !== undefined) {
        return `${formatAmount(prize.cashAmount)}元现金`;
      }
      return count === undefined || count <= 1 ? name : `${name}x${count}`;
    })
    .filter(Boolean)
    .join("、");
}

function sortRewards(rewards: DistributionIncentiveRewardVO[] | undefined) {
  return [...asArray(rewards)].sort((left, right) => normalizeSort(left.sort) - normalizeSort(right.sort));
}

function mapActivityStatus(displayState: number | undefined): ActivityStatus {
  if (displayState === 0) {
    return "paused";
  }
  if (displayState === 4) {
    return "claiming";
  }
  if (displayState === 5 || displayState === 6) {
    return "ended";
  }
  return "active";
}

function cardStatusText(displayState: number | undefined) {
  if (displayState === 1 || displayState === 2) {
    return undefined;
  }
  return statusText(displayState);
}

function statusText(displayState: number | undefined) {
  switch (displayState) {
    case 0:
      return "已暂停";
    case 1:
      return "未开始";
    case 2:
      return "进行中";
    case 3:
      return "待结算";
    case 4:
      return "领奖中";
    case 5:
      return "已结束";
    case 6:
      return "已结束";
    default:
      return "活动中";
  }
}

function incentiveTypeText(incentiveType: number) {
  switch (incentiveType) {
    case 1:
      return "销量达标";
    case 2:
      return "销售额达标";
    case 3:
      return "销量排行";
    case 4:
      return "销售额排行";
    default:
      return "激励活动";
  }
}

function prizeTypeText(prizeType: number | undefined) {
  switch (prizeType) {
    case 1:
      return "现金";
    case 2:
      return "优惠券";
    case 3:
      return "实物";
    default:
      return "奖励";
  }
}

function deliverStateText(deliverState: number | undefined) {
  switch (deliverState) {
    case 0:
      return "待领取";
    case 1:
      return "待发放";
    case 2:
      return "已发放";
    default:
      return "待确认";
  }
}

function buildPeriodText(startTime: string | undefined, endTime: string | undefined) {
  if (startTime && endTime) {
    return `活动时间：${formatDate(startTime)}-${formatDate(endTime)}`;
  }
  return "活动时间以页面展示为准";
}

function formatDate(value: string) {
  const date = value.trim().slice(0, 10);
  const parts = date.split("-");
  if (parts.length === 3) {
    return `${Number(parts[0])}.${Number(parts[1])}.${Number(parts[2])}`;
  }
  return value.trim();
}

function asArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function optionalText(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function stripHtml(value: string | undefined) {
  return value?.replace(/<[^>]*>/g, "").trim();
}

function appendOptionalParam(searchParams: URLSearchParams, key: string, value: string | number | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  searchParams.set(key, String(value));
}

function appendArrayParam(searchParams: URLSearchParams, key: string, values: number[] | undefined) {
  (values ?? []).forEach((value) => {
    if (Number.isFinite(value)) {
      searchParams.append(key, String(value));
    }
  });
}

function normalizeIdParam(value: string) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function normalizeIncentiveType(value: unknown) {
  return typeof value === "number" && [1, 2, 3, 4].includes(value) ? value : 1;
}

function normalizePageParams({ current, size }: { current: number; size: number }) {
  return {
    current: normalizePositiveInteger(current, 1),
    size: Math.min(100, normalizePositiveInteger(size, 10))
  };
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function normalizeOptionalNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
}

function normalizeOptionalNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function normalizeNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizePercent(value: unknown) {
  return Math.max(0, Math.min(100, normalizeNonNegativeNumber(value)));
}

function normalizeSort(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 9999;
}

function formatAmount(value: unknown) {
  const amount = normalizeNonNegativeNumber(value);
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.?0+$/, "");
}

function rankText(value: unknown) {
  const rank = normalizeOptionalNonNegativeInteger(value);
  return rank === undefined || rank === 0 ? "--" : String(rank);
}

function currentRank(progress: DistributionIncentiveProgressVO | undefined, incentiveType: number) {
  return incentiveType === 3 ? progress?.saleRank : progress?.gmvRank;
}

function buildRankProgress(rank: number | undefined, threshold: number | undefined) {
  if (rank === undefined || threshold === undefined || threshold <= 0) {
    return 0;
  }
  if (rank <= threshold) {
    return 100;
  }
  return Math.max(0, Math.min(99, Math.round((threshold / rank) * 100)));
}

function defaultMilestoneLabels(incentiveType: number) {
  return incentiveType === 1 ? ["0单", "达标"] : incentiveType === 2 ? ["0元", "达标"] : ["未上榜", "达标"];
}

function hasMorePages({
  current,
  pages,
  recordCount,
  size,
  total
}: {
  current: number;
  pages?: number;
  recordCount: number;
  size: number;
  total?: number;
}) {
  if (pages !== undefined) {
    return current < pages;
  }
  if (total !== undefined) {
    return current * size < total;
  }
  return recordCount >= size;
}

function normalizeImageUrl(value: string | undefined) {
  const imagePath = value?.trim();
  if (!imagePath) {
    return undefined;
  }
  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    return imagePath;
  }
  const assetBaseUrl = process.env.JAVA_OSS_ASSET_BASE_URL?.trim();
  if (!assetBaseUrl) {
    return imagePath;
  }
  return `${assetBaseUrl.replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}
