import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

export type WalletState = "pending" | "settled";

export type WalletSummaryView = {
  balanceText: string;
  pendingIncomeText: string;
  settledIncomeText: string;
  unsettledText: string;
  withdrawText: string;
  withdrawableText: string;
};

export type WalletOrderView = {
  amountText: string;
  detailHref?: string;
  id: string;
  imageUrl?: string;
  status: WalletState | "invalid" | "unpaid";
  time: string;
  title: string;
};

export type WalletWithdrawStatus = "failed" | "pending" | "processing" | "success";

export type WalletWithdrawRecordView = {
  amountText: string;
  id: string;
  orderNo: string;
  status: WalletWithdrawStatus;
  statusText: string;
  time: string;
  title: string;
};

export type WalletWithdrawRecordGroupView = {
  date: string;
  records: WalletWithdrawRecordView[];
};

export type WalletPageData = {
  modules: {
    orders: Required<WalletJavaPage<WalletJavaPromotionOrder>>;
    overview?: WalletDistributionOverview;
    wallet: WalletDistributionSummary;
  };
  page: {
    current: number;
    hasMore: boolean;
    pages: number;
    size: number;
    total: number;
  };
  view: {
    orders: WalletOrderView[];
    summary: WalletSummaryView;
  };
};

export type WalletSummaryData = {
  modules: {
    wallet: WalletDistributionSummary;
  };
  view: {
    summary: WalletSummaryView;
  };
};

export type WalletOrdersPageData = {
  modules: {
    orders: Required<WalletJavaPage<WalletJavaPromotionOrder>>;
  };
  page: {
    current: number;
    hasMore: boolean;
    pages: number;
    size: number;
    total: number;
  };
  view: {
    orders: WalletOrderView[];
  };
};

export type WalletWithdrawRecordsPageData = {
  modules: {
    withdrawRecords: Required<WalletJavaPage<WalletJavaWithdrawRecordGroup>>;
  };
  page: {
    current: number;
    hasMore: boolean;
    pages: number;
    size: number;
    total: number;
  };
  view: {
    groups: WalletWithdrawRecordGroupView[];
  };
};

export type BankCardView = {
  acctNum: string;
  bankName: string;
  cardTypeText: string;
  id: string;
  maskedCardNo: string;
  signNum?: string;
};

export type BankCardsPageData = {
  modules: {
    cards: WalletJavaBankCard[];
    overview: WalletDistributionOverview;
  };
  view: {
    cards: BankCardView[];
  };
};

export type BankCardMutationData = {
  modules: {
    raw: unknown;
  };
  view: {
    message: string;
    ok: true;
  };
};

export type WalletJavaEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
};

export type WalletDistributionSummary = {
  addupAmount?: unknown;
  applyWithdrawAmount?: unknown;
  extractedAmount?: unknown;
  invalidAmount?: unknown;
  settledAmount?: unknown;
  unsettledAmount?: unknown;
};

export type WalletDistributionOverview = {
  userInfo?: {
    cardNo?: unknown;
    distributionUserId?: unknown;
  };
};

export type WalletJavaPage<T> = {
  current?: unknown;
  pages?: unknown;
  records?: T[];
  size?: unknown;
  total?: unknown;
};

export type WalletJavaPromotionOrder = {
  createTime?: unknown;
  distributionAmount?: unknown;
  orderNumber?: unknown;
  pic?: unknown;
  prodName?: unknown;
  state?: unknown;
  updateTime?: unknown;
};

export type WalletJavaWithdrawRecordGroup = {
  date?: unknown;
  withdrawCashVOs?: WalletJavaWithdrawRecord[];
};

export type WalletJavaWithdrawRecord = {
  amount?: unknown;
  cashId?: unknown;
  createTime?: unknown;
  orderNo?: unknown;
  status?: unknown;
  updateTime?: unknown;
};

export type WalletJavaBankCard = {
  bankCardNo?: unknown;
  bankName?: unknown;
  bindStatus?: unknown;
  cardType?: unknown;
};

type WalletBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export async function fetchWalletSummaryData({
  authToken,
  backendClient,
  route
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  route: string;
}): Promise<BackendApiResult<WalletSummaryData>> {
  const walletResult = await requestJava<WalletDistributionSummary>({
    authToken,
    backendClient,
    path: "/p/distribution/wallet/info",
    route,
    fallbackMessage: "钱包数据获取失败。"
  });
  if (!walletResult.ok) {
    return walletResult;
  }

  return {
    ok: true,
    data: {
      modules: {
        wallet: walletResult.data
      },
      view: {
        summary: mapWalletSummary(walletResult.data)
      }
    },
    meta: walletResult.meta
  };
}

export async function fetchWalletOrdersData({
  authToken,
  backendClient,
  current = 1,
  javaOssAssetBaseUrl,
  promotionOrderUserId,
  route,
  size = 10,
  state = "settled"
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  promotionOrderUserId?: string | null;
  route: string;
  size?: number;
  state?: WalletState;
}): Promise<BackendApiResult<WalletOrdersPageData>> {
  const normalizedPromotionOrderUserId = normalizeText(promotionOrderUserId);
  if (!normalizedPromotionOrderUserId) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "用户手机号缺失，无法获取推广订单。"
      })
    };
  }

  const normalizedCurrent = normalizePositiveInteger(current, 1);
  const normalizedSize = normalizePositiveInteger(size, 10);
  const query = new URLSearchParams({
    current: String(normalizedCurrent),
    size: String(normalizedSize),
    state: String(state === "pending" ? 1 : 2),
    userId: normalizedPromotionOrderUserId
  });
  const ordersResult = await requestJava<WalletJavaPage<WalletJavaPromotionOrder>>({
    authToken,
    backendClient,
    path: `/p/distribution/api/queryPromotionOrder?${query.toString()}`,
    route,
    fallbackMessage: "推广订单获取失败。"
  });
  if (!ordersResult.ok) {
    return ordersResult;
  }

  const orders = normalizePage(ordersResult.data, normalizedSize);

  return {
    ok: true,
    data: {
      modules: {
        orders
      },
      page: mapPage(orders),
      view: {
        orders: orders.records.map((order) => mapPromotionOrder(order, { javaOssAssetBaseUrl })).filter(isWalletOrderView)
      }
    },
    meta: ordersResult.meta
  };
}

export async function fetchWalletData(input: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  promotionOrderUserId?: string | null;
  route: string;
  size?: number;
  state?: WalletState;
}): Promise<BackendApiResult<WalletPageData>> {
  const summaryResult = await fetchWalletSummaryData(input);
  if (!summaryResult.ok) {
    return summaryResult;
  }
  const ordersResult = await fetchWalletOrdersData(input);
  if (!ordersResult.ok) {
    return ordersResult;
  }

  return {
    ok: true,
    data: {
      modules: {
        orders: ordersResult.data.modules.orders,
        wallet: summaryResult.data.modules.wallet
      },
      page: ordersResult.data.page,
      view: {
        orders: ordersResult.data.view.orders,
        summary: summaryResult.data.view.summary
      }
    },
    meta: summaryResult.meta
  };
}

export async function fetchWalletWithdrawRecordsData({
  authToken,
  backendClient,
  current = 1,
  route,
  size = 10
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  current?: number;
  route: string;
  size?: number;
}): Promise<BackendApiResult<WalletWithdrawRecordsPageData>> {
  const normalizedCurrent = normalizePositiveInteger(current, 1);
  const normalizedSize = normalizePositiveInteger(size, 10);
  const query = new URLSearchParams({
    current: String(normalizedCurrent),
    size: String(normalizedSize)
  });
  const recordsResult = await requestJava<WalletJavaPage<WalletJavaWithdrawRecordGroup>>({
    authToken,
    backendClient,
    path: `/p/userWithdraw/pageDateUserWithdrawCash?${query.toString()}`,
    route,
    fallbackMessage: "提现记录获取失败。"
  });
  if (!recordsResult.ok) {
    return recordsResult;
  }

  const withdrawRecords = normalizePage(recordsResult.data, normalizedSize);

  return {
    ok: true,
    data: {
      modules: {
        withdrawRecords
      },
      page: mapPage(withdrawRecords),
      view: {
        groups: withdrawRecords.records.map(mapWithdrawRecordGroup).filter(isWithdrawRecordGroupView)
      }
    },
    meta: recordsResult.meta
  };
}

export async function fetchBankCardsData({
  authToken,
  backendClient,
  route
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  route: string;
}): Promise<BackendApiResult<BankCardsPageData>> {
  const overviewResult = await requestDistributionOverview({ authToken, backendClient, route });
  if (!overviewResult.ok) {
    return overviewResult;
  }

  const cardsResult = await requestJava<WalletJavaBankCard[]>({
    authToken,
    backendClient,
    path: "/p/allinpay/member/queryBankCardV2",
    route,
    fallbackMessage: "银行卡获取失败。"
  });
  if (!cardsResult.ok) {
    return cardsResult;
  }

  const signNum = normalizeText(overviewResult.data.userInfo?.cardNo);
  const cards = Array.isArray(cardsResult.data) ? cardsResult.data : [];

  return {
    ok: true,
    data: {
      modules: {
        cards,
        overview: overviewResult.data
      },
      view: {
        cards: cards.map((card) => mapBankCard(card, signNum)).filter(isBankCardView)
      }
    },
    meta: cardsResult.meta
  };
}

export async function unbindBankCard({
  acctNum,
  authToken,
  backendClient,
  route,
  signNum
}: {
  acctNum: string;
  authToken: string | null;
  backendClient: WalletBackendClient;
  route: string;
  signNum: string;
}): Promise<BackendApiResult<BankCardMutationData>> {
  const normalizedAcctNum = normalizeText(acctNum);
  const normalizedSignNum = normalizeText(signNum);
  if (!normalizedAcctNum || !normalizedSignNum) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "解绑银行卡缺少会员编号或银行卡号。"
      })
    };
  }

  const result = await requestJava<unknown>({
    authToken,
    backendClient,
    body: {
      acctNum: normalizedAcctNum,
      signNum: normalizedSignNum
    },
    method: "POST",
    path: "/p/allinpay/member/unbindBankCardV2",
    route,
    fallbackMessage: "解绑银行卡失败。"
  });
  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: {
      modules: {
        raw: result.data
      },
      view: {
        ok: true,
        message: "银行卡已解绑。"
      }
    },
    meta: result.meta
  };
}

async function requestDistributionOverview({
  authToken,
  backendClient,
  route
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  route: string;
}) {
  return requestJava<WalletDistributionOverview>({
    authToken,
    backendClient,
    path: "/p/distribution/home/overview",
    route,
    fallbackMessage: "推广概览获取失败。"
  });
}

async function requestJava<T>({
  authToken,
  backendClient,
  body,
  fallbackMessage,
  method,
  path,
  route
}: {
  authToken: string | null;
  backendClient: WalletBackendClient;
  body?: unknown;
  fallbackMessage: string;
  method?: string;
  path: string;
  route: string;
}): Promise<BackendApiResult<T>> {
  const response = await backendClient.request<WalletJavaEnvelope<T>>({
    authRequired: true,
    authToken,
    backend: "java",
    body,
    method,
    path,
    route
  });
  if (!response.ok) {
    return response;
  }

  return unwrapJavaEnvelope(response.data, response.meta.requestId, route, fallbackMessage);
}

function unwrapJavaEnvelope<T>(envelope: WalletJavaEnvelope<T>, requestId: string | undefined, route: string, fallbackMessage: string): BackendApiResult<T> {
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? fallbackMessage,
        requestId
      })
    };
  }

  return {
    ok: true,
    data: envelope.data as T,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "unknown",
      requestId: requestId ?? "unknown",
      route
    }
  };
}

function isJavaSuccess(envelope: WalletJavaEnvelope<unknown>) {
  return envelope.success !== false && (envelope.code === undefined || envelope.code === "00000");
}

function mapWalletSummary(summary: WalletDistributionSummary): WalletSummaryView {
  return {
    balanceText: formatNumber(summary.addupAmount),
    pendingIncomeText: `+${formatNumber(summary.unsettledAmount)}`,
    settledIncomeText: `+${formatNumber(summary.settledAmount)}`,
    unsettledText: formatNumber(summary.unsettledAmount),
    withdrawText: formatNumber(summary.extractedAmount),
    withdrawableText: formatNumber(summary.settledAmount)
  };
}

function mapPromotionOrder(order: WalletJavaPromotionOrder, { javaOssAssetBaseUrl }: { javaOssAssetBaseUrl?: string }): WalletOrderView | null {
  const orderNumber = normalizeText(order.orderNumber);
  const title = normalizeText(order.prodName, "推广订单");
  const amount = normalizeMoney(order.distributionAmount, 0);
  const id = orderNumber || `${title}-${normalizeText(order.createTime, normalizeText(order.updateTime))}-${amount}`;
  if (!id) {
    return null;
  }

  return {
    amountText: `${amount >= 0 ? "+" : ""}${formatAmountText(amount)}`,
    ...(orderNumber ? { detailHref: `/orders/${encodeURIComponent(orderNumber)}` } : {}),
    id,
    imageUrl: resolveAssetUrl(order.pic, javaOssAssetBaseUrl),
    status: mapOrderStatus(order.state),
    time: normalizeText(order.createTime, normalizeText(order.updateTime)),
    title
  };
}

function mapOrderStatus(state: unknown): WalletOrderView["status"] {
  if (Number(state) === 1) {
    return "pending";
  }
  if (Number(state) === 2) {
    return "settled";
  }
  if (Number(state) === -1) {
    return "invalid";
  }
  return "unpaid";
}

function mapWithdrawRecordGroup(group: WalletJavaWithdrawRecordGroup): WalletWithdrawRecordGroupView | null {
  const records = Array.isArray(group.withdrawCashVOs) ? group.withdrawCashVOs.map(mapWithdrawRecord).filter(isWithdrawRecordView) : [];
  if (records.length === 0) {
    return null;
  }

  return {
    date: normalizeText(group.date, "提现记录"),
    records
  };
}

function mapWithdrawRecord(record: WalletJavaWithdrawRecord): WalletWithdrawRecordView | null {
  const amount = normalizeMoney(record.amount, 0);
  const id = normalizeText(record.cashId, normalizeText(record.orderNo));
  if (!id) {
    return null;
  }
  const status = mapWithdrawStatus(record.status);

  return {
    amountText: `-¥${formatAmountText(amount)}`,
    id,
    orderNo: normalizeText(record.orderNo),
    status,
    statusText: mapWithdrawStatusText(status),
    time: normalizeText(record.createTime, normalizeText(record.updateTime)),
    title: "提现"
  };
}

function mapWithdrawStatus(status: unknown): WalletWithdrawStatus {
  if (Number(status) === 2) {
    return "success";
  }
  if (Number(status) === 3) {
    return "failed";
  }
  if (Number(status) === 1) {
    return "processing";
  }
  return "pending";
}

function mapWithdrawStatusText(status: WalletWithdrawStatus) {
  if (status === "success") {
    return "成功";
  }
  if (status === "failed") {
    return "失败";
  }
  if (status === "processing") {
    return "到帐中";
  }
  return "待支付";
}

function mapBankCard(card: WalletJavaBankCard, signNum: string): BankCardView | null {
  if (String(card.bindStatus ?? "1") === "2") {
    return null;
  }
  const acctNum = normalizeText(card.bankCardNo);
  if (!acctNum) {
    return null;
  }

  return {
    acctNum,
    bankName: normalizeText(card.bankName, "银行卡"),
    cardTypeText: String(card.cardType) === "1" ? "信用卡" : String(card.cardType) === "0" ? "储蓄卡" : "银行卡",
    id: acctNum,
    maskedCardNo: maskBankCardNo(acctNum),
    ...(signNum ? { signNum } : {})
  };
}

function isWalletOrderView(value: WalletOrderView | null): value is WalletOrderView {
  return value !== null;
}

function isBankCardView(value: BankCardView | null): value is BankCardView {
  return value !== null;
}

function isWithdrawRecordGroupView(value: WalletWithdrawRecordGroupView | null): value is WalletWithdrawRecordGroupView {
  return value !== null;
}

function isWithdrawRecordView(value: WalletWithdrawRecordView | null): value is WalletWithdrawRecordView {
  return value !== null;
}

function normalizePage<T>(page: WalletJavaPage<T> | null | undefined, fallbackSize: number): Required<WalletJavaPage<T>> {
  return {
    current: normalizePositiveInteger(page?.current, 1),
    pages: normalizePositiveInteger(page?.pages, 1),
    records: Array.isArray(page?.records) ? page.records : [],
    size: normalizePositiveInteger(page?.size, fallbackSize),
    total: normalizePositiveInteger(page?.total, 0)
  };
}

function mapPage<T>(page: Required<WalletJavaPage<T>>) {
  return {
    current: Number(page.current),
    hasMore: Number(page.current) < Number(page.pages),
    pages: Number(page.pages),
    size: Number(page.size),
    total: Number(page.total)
  };
}

function normalizeText(value: unknown, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = Math.floor(normalizeNumber(value, fallback));
  return parsed >= 0 ? parsed : fallback;
}

function normalizeMoney(value: unknown, fallback: number) {
  return Math.round(normalizeNumber(value, fallback) * 100) / 100;
}

function formatNumber(value: unknown) {
  return normalizeMoney(value, 0).toFixed(2);
}

function formatAmountText(value: unknown) {
  const amount = normalizeMoney(value, 0);
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function resolveAssetUrl(value: unknown, baseUrl?: string) {
  const path = normalizeText(value, "");
  if (!path) {
    return undefined;
  }
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  const base = baseUrl ?? process.env.JAVA_OSS_ASSET_BASE_URL ?? "";
  if (!base) {
    return path;
  }
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function maskBankCardNo(acctNum: string) {
  const digits = acctNum.replace(/\s+/g, "");
  const tail = digits.slice(-4);
  return tail ? `**** **** **** ${tail}` : "**** **** ****";
}
