import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import type { ActivityStatus, PromotionActivitiesData, PromotionActivityDetailData } from "../types";

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
  alreadyRewardIds?: number[];
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
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
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

  const rewardResult = await backendClient.request<PromotionIncentiveServerResponse<DistributionIncentiveAppRewardRecordVO>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/app/distribution/incentive/reward/detail/${normalizedActivityId}`,
    route: `/promotion/activities/${normalizedActivityId}`
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
    data: createPromotionIncentiveActivityDetailBffData({
      detail: detail.data,
      rawDetail: includeDebugRaw ? detailResult.data : undefined,
      rawReward: includeDebugRaw ? rewardResult.data : undefined,
      reward: reward.data
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
    data: {
      ...(includeDebugRaw ? { debugRaw: { reward: rewardResult.data } } : {}),
      modules: {
        reward: reward.data ?? null
      },
      reward: reward.data ?? null
    },
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
    activeCount: activities.filter((activity) => activity.displayState === 2 || activity.displayState === 4).length,
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
  const status = mapActivityStatus(detail.displayState);
  const titleParts = splitActivityTitle(detail.title, incentiveType);
  const rewardItems = mapRewardItems(detail.rewards, reward);

  return {
    ...(rawDetail === undefined && rawReward === undefined ? {} : {
      debugRaw: {
        ...(rawDetail === undefined ? {} : { detail: rawDetail }),
        ...(rawReward === undefined ? {} : { reward: rawReward })
      }
    }),
    actionHref: status === "active" ? "/promotion/products" : undefined,
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
    rewards: rewardItems,
    rules: buildDetailRules(detail, incentiveType),
    statusKind: status === "claiming" || rewardItems.some((item) => item.canReceive) ? "primary" : "neutral",
    statusText: buildDetailStatusText(status, rewardItems),
    title: {
      ...titleParts,
      highlightTone: incentiveType === 1 || incentiveType === 2 ? "order" : "pk"
    }
  };
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
    description: activity.description?.trim() || activity.ruleSummary?.trim() || incentiveTypeText(incentiveType),
    href: `/promotion/activities/${activity.id}`,
    iconKind: incentiveType === 1 || incentiveType === 2 ? "order" as const : "pk" as const,
    id: String(activity.id ?? ""),
    periodText: buildPeriodText(activity.startTime, activity.endTime),
    progressLabel: progressInfo.label,
    progressPercent: progressInfo.percent ?? progress,
    progressValue: progressInfo.value,
    status,
    statusText: statusText(activity.displayState),
    tag: incentiveTypeText(incentiveType),
    title: activity.title?.trim() || incentiveTypeText(incentiveType)
  };
}

function buildCardProgress(activity: DistributionIncentiveCardPageVO, incentiveType: number) {
  if (incentiveType === 1) {
    return {
      label: "当前销量",
      percent: normalizePercent(activity.currentProgress),
      value: `${normalizeNonNegativeNumber(activity.saleCount)}单`
    };
  }
  if (incentiveType === 2) {
    return {
      label: "当前GMV",
      percent: normalizePercent(activity.currentProgress),
      value: `¥${formatAmount(activity.gmv)}`
    };
  }
  if (incentiveType === 3) {
    const threshold = normalizeOptionalNonNegativeInteger(activity.rankThresholdVal);
    const rank = normalizeOptionalNonNegativeInteger(activity.saleRank);
    return {
      label: threshold === undefined ? "当前排名" : `目标进入TOP${threshold}`,
      percent: buildRankProgress(rank, threshold),
      value: rank === undefined ? "暂未上榜" : `第${rank}名`
    };
  }
  const threshold = normalizeOptionalNonNegativeInteger(activity.rankThresholdVal);
  const rank = normalizeOptionalNonNegativeInteger(activity.gmvRank);
  return {
    label: threshold === undefined ? "当前排名" : `目标进入TOP${threshold}`,
    percent: buildRankProgress(rank, threshold),
    value: rank === undefined ? "暂未上榜" : `第${rank}名`
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
      label: "累计GMV",
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
      { label: "累计GMV", value: formatAmount(detail.progress?.gmv ?? reward?.gmv) }
    ]
  };
}

function buildDetailProgress(detail: DistributionIncentiveAppDetailVO, incentiveType: number): PromotionActivityDetailData["progress"] {
  const rewards = sortRewards(detail.rewards);
  const completedCount = normalizeOptionalNonNegativeInteger(detail.completedDistributorCount);
  const completedText = completedCount === undefined ? "当前活动进度统计中" : `当前活动已有${completedCount}位达人完成`;
  const alreadyRewardIds = new Set((detail.progress?.alreadyRewardIds ?? []).map(String));
  const percent = incentiveType === 1 || incentiveType === 2 ? normalizePercent(detail.progress?.currentProgress) : buildRankProgress(currentRank(detail.progress, incentiveType), lastRankThreshold(rewards));

  return {
    amountLabels: incentiveType === 2 ? rewards.map((reward) => `${formatAmount(reward.thresholdVal)}元`) : undefined,
    complete: percent >= 100,
    completedText,
    hintText: buildProgressHint(detail, incentiveType, alreadyRewardIds),
    milestoneLabels: rewards.length > 0 ? rewards.map((reward) => rewardMilestoneLabel(reward, incentiveType)) : defaultMilestoneLabels(incentiveType),
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
    description: detail.ruleSummary?.trim() || detail.ruleContent?.replace(/<[^>]*>/g, "").trim() || "活动规则以页面展示和后端结算结果为准",
    rows: rows.length > 0 ? rows : [["活动规则", "奖励待公布"]]
  };
}

function mapRewardItems(
  rewards: DistributionIncentiveRewardVO[] | undefined,
  rewardRecord: DistributionIncentiveAppRewardRecordVO | undefined
): NonNullable<PromotionActivityDetailData["rewards"]> {
  const recordDetails = rewardRecord?.details ?? [];
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
      title: reward.description?.trim() || rewardMilestoneLabel(reward, normalizeIncentiveType(rewardRecord?.incentiveType))
    };
  });
}

function buildDetailStatusText(
  status: ActivityStatus,
  rewards: NonNullable<PromotionActivityDetailData["rewards"]>
) {
  if (rewards.some((reward) => reward.canReceive)) {
    return "去领奖";
  }
  if (status === "claiming") {
    return "领奖中";
  }
  if (status === "active") {
    return "去带货";
  }
  return "活动已结束";
}

function splitActivityTitle(title: string | undefined, incentiveType: number) {
  const fallbackHighlight = incentiveType === 1 ? "销量" : incentiveType === 2 ? "GMV" : "PK";
  const value = title?.trim();
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
  if (detail.ruleSummary?.trim()) {
    return detail.ruleSummary.trim();
  }
  if (incentiveType === 1) {
    return "销量达标可获激励";
  }
  if (incentiveType === 2) {
    return "GMV达标可获激励";
  }
  return "排名达标可获激励";
}

function buildProgressHint(
  detail: DistributionIncentiveAppDetailVO,
  incentiveType: number,
  alreadyRewardIds: Set<string>
) {
  const rewards = sortRewards(detail.rewards);
  const nextReward = rewards.find((reward) => !alreadyRewardIds.has(String(reward.id ?? "")));
  if (!nextReward) {
    return "您已完成当前活动目标，请关注奖励发放状态";
  }

  if (incentiveType === 1) {
    return `再完成至${formatAmount(nextReward.thresholdVal)}单可获得${rewardPrizeText(nextReward.prizes) || "奖励"}`;
  }
  if (incentiveType === 2) {
    return `再完成至${formatAmount(nextReward.thresholdVal)}元GMV可获得${rewardPrizeText(nextReward.prizes) || "奖励"}`;
  }
  return `进入${rewardMilestoneLabel(nextReward, incentiveType)}可获得${rewardPrizeText(nextReward.prizes) || "奖励"}`;
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
  return reward.description?.trim() || "排名达标";
}

function rewardPrizeText(prizes: DistributionIncentivePrizeVO[] | undefined) {
  return (prizes ?? [])
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
  return [...(rewards ?? [])].sort((left, right) => normalizeSort(left.sort) - normalizeSort(right.sort));
}

function mapActivityStatus(displayState: number | undefined): ActivityStatus {
  if (displayState === 4) {
    return "claiming";
  }
  if (displayState === 5) {
    return "ended";
  }
  return "active";
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
    default:
      return "活动中";
  }
}

function incentiveTypeText(incentiveType: number) {
  switch (incentiveType) {
    case 1:
      return "销量达标";
    case 2:
      return "GMV达标";
    case 3:
      return "销量排行";
    case 4:
      return "GMV排行";
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

function appendOptionalParam(searchParams: URLSearchParams, key: string, value: string | number | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  searchParams.set(key, String(value));
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

function lastRankThreshold(rewards: DistributionIncentiveRewardVO[]) {
  return rewards.reduce<number | undefined>((threshold, reward) => {
    if (reward.rankTo === undefined) {
      return threshold;
    }
    return threshold === undefined ? reward.rankTo : Math.max(threshold, reward.rankTo);
  }, undefined);
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
  return imagePath || undefined;
}
