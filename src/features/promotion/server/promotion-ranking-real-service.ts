import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { getJavaResponseCodeMeta, mapJavaBusinessCodeToApiErrorCode } from "@/server/http/java-response-codes";
import { normalizeRankingPeriod } from "./promotion-service";
import type { RankingData, RankingPeriod, RankingRow, RankingType } from "../types";

type PromotionRankingBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type PromotionRankingServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type DistributionRankDto = {
  distributionUserId?: number;
  nickName?: string;
  pic?: string;
  rankNo?: number;
  score?: number;
  [key: string]: unknown;
};

export type DistributionRankMyDto = DistributionRankDto & {
  onRank?: boolean;
};

export type DistributionRankPageDto = {
  endTime?: string;
  myRank?: DistributionRankMyDto;
  period?: number;
  rankList?: DistributionRankDto[];
  rankType?: number;
  startTime?: string;
  statPeriod?: string;
  [key: string]: unknown;
};

export type PromotionRankingBffData = RankingData & {
  modules: {
    page: DistributionRankPageDto;
  };
  debugRaw?: {
    page?: PromotionRankingServerResponse<DistributionRankPageDto>;
  };
};

export type FetchPromotionRankingOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: PromotionRankingBackendClient;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  period?: string | null;
  rankingType: Extract<RankingType, "sales" | "amount">;
  statPeriod?: string | null;
};

const rankTypeByRankingType = {
  sales: 1,
  amount: 2
} as const satisfies Record<Extract<RankingType, "sales" | "amount">, number>;

const rankingTabs: RankingData["tabs"] = [
  { id: "sales", title: "达人销量榜", href: "/promotion/ranking/sales" },
  { id: "amount", title: "达人销售额榜", href: "/promotion/ranking/amount" },
  { id: "incentive", title: "达人激励榜", href: "/promotion/ranking/incentive" }
];

export async function fetchPromotionRankingData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  includeDebugRaw = false,
  period,
  rankingType,
  statPeriod
}: FetchPromotionRankingOptions): Promise<BackendApiResult<PromotionRankingBffData>> {
  const activePeriod = normalizeRankingPeriod(period);
  const pagePath = buildRankPath("/p/distribution/rank/list", {
    period: periodCode(activePeriod),
    rankType: rankTypeByRankingType[rankingType],
    statPeriod
  });

  const pageResult = await backendClient.request<PromotionRankingServerResponse<DistributionRankPageDto>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: pagePath,
    route: `/promotion/ranking/${rankingType}`
  });
  if (!pageResult.ok) {
    return pageResult;
  }

  const page = unwrapPromotionRankingData(pageResult.data, pageResult.meta.requestId);
  if (!page.ok) {
    return page;
  }

  return {
    ok: true,
    data: createPromotionRankingBffData({
      activePeriod,
      page: page.data,
      rankingType,
      rawPage: includeDebugRaw ? pageResult.data : undefined
    }),
    meta: pageResult.meta
  };
}

export function createPromotionRankingBffData({
  activePeriod,
  page,
  rankingType,
  rawPage
}: {
  activePeriod: RankingPeriod;
  page: DistributionRankPageDto;
  rankingType: Extract<RankingType, "sales" | "amount">;
  rawPage?: PromotionRankingServerResponse<DistributionRankPageDto>;
}): PromotionRankingBffData {
  const unit = rankingType === "sales" ? "单" : "元";
  const rows = (page.rankList ?? []).map((item, index) => mapRankRow(item, unit, index));

  return {
    ...(rawPage === undefined ? {} : {
      debugRaw: {
        page: rawPage
      }
    }),
    activePeriod,
    currentUser: mapCurrentUser(page.myRank, unit),
    modules: {
      page
    },
    periodText: buildPeriodText(page, activePeriod),
    rankingType,
    rows,
    tabs: rankingTabs
  };
}

export function createPromotionIncentiveRankingEmptyData(period?: string | null): RankingData {
  const activePeriod = normalizeRankingPeriod(period);

  return {
    activePeriod,
    currentUser: {
      avatar: null,
      name: "喵呜达人",
      onList: false,
      rank: 0,
      unit: "元",
      value: "--"
    },
    periodText: buildPeriodFallbackText(activePeriod),
    rankingType: "incentive",
    rows: [],
    tabs: rankingTabs
  };
}

function unwrapPromotionRankingData<T>(response: PromotionRankingServerResponse<T>, requestId: string): BackendApiResult<T> {
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
      route: "/promotion/ranking"
    }
  };
}

function mapRankRow(item: DistributionRankDto, unit: RankingRow["unit"], index: number): RankingRow {
  return {
    avatar: normalizeImageUrl(item.pic),
    name: item.nickName?.trim() || `喵呜达人${index + 1}`,
    rank: normalizeRankNo(item.rankNo, index + 1),
    unit,
    value: formatRankScore(item.score, unit)
  };
}

function mapCurrentUser(myRank: DistributionRankMyDto | undefined, unit: RankingRow["unit"]): RankingData["currentUser"] {
  const onList = myRank?.onRank === true;

  return {
    avatar: normalizeImageUrl(myRank?.pic),
    name: myRank?.nickName?.trim() || "喵呜达人",
    onList,
    rank: onList ? normalizeRankNo(myRank?.rankNo, 0) : 0,
    unit,
    value: onList ? formatRankScore(myRank?.score, unit) : "--"
  };
}

function buildRankPath(basePath: string, params: { period: number; rankType?: number; statPeriod?: string | null }) {
  const searchParams = new URLSearchParams({
    period: String(params.period)
  });
  if (params.rankType !== undefined) {
    searchParams.set("rankType", String(params.rankType));
  }
  if (params.statPeriod?.trim()) {
    searchParams.set("statPeriod", params.statPeriod.trim());
  }

  return `${basePath}?${searchParams.toString()}`;
}

function periodCode(period: RankingPeriod) {
  return period === "day" ? 1 : period === "week" ? 2 : 3;
}

function buildPeriodText(page: DistributionRankPageDto, activePeriod: RankingPeriod) {
  if (page.startTime && page.endTime) {
    return `榜单周期：${page.startTime} - ${page.endTime}`;
  }
  if (page.statPeriod?.trim()) {
    return `榜单周期：${page.statPeriod.trim()}`;
  }
  return buildPeriodFallbackText(activePeriod);
}

function buildPeriodFallbackText(activePeriod: RankingPeriod) {
  const labelByPeriod: Record<RankingPeriod, string> = {
    day: "本日",
    month: "本月",
    week: "本周"
  };

  return `榜单周期：${labelByPeriod[activePeriod]}`;
}

function formatRankScore(score: number | undefined, unit: RankingRow["unit"]) {
  const value = Number(score ?? 0);
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (unit === "单") {
    return String(Math.max(0, Math.trunc(value)));
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    useGrouping: false
  });
}

function normalizeImageUrl(value: string | undefined) {
  const imageUrl = value?.trim();
  return imageUrl ? imageUrl : null;
}

function normalizeRankNo(rankNo: number | undefined, fallback: number) {
  return Number.isInteger(rankNo) && rankNo !== undefined && rankNo > 0 ? rankNo : fallback;
}
