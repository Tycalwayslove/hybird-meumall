import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
export { createCashierHrefFromSubmitResult } from "../cashier-links";

type CashierBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export type PaymentServerResponse<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
  [key: string]: unknown;
};

export type JavaOrderPayInfo = {
  endTime?: string;
  status?: number;
  totalFee?: number;
  totalScore?: number;
  [key: string]: unknown;
};

export type JavaPaymentSwitchInfo = {
  aliPaySwitch?: boolean;
  balancePaySwitch?: boolean;
  payPalSwitch?: boolean;
  wxPaySwitch?: boolean;
  [key: string]: unknown;
};

export type JavaOrderPayResult = Record<string, unknown> | string;

export type JavaAllinpayOrderStatus = {
  orderStatus?: number;
  [key: string]: unknown;
};

export type CashierPaymentMethod = {
  id: "aliPay" | "wechatPay";
  label: string;
  payType: 7 | 8;
};

export type OrderPayInfoData = {
  debugRaw?: {
    orderPayInfo: PaymentServerResponse<JavaOrderPayInfo>;
    paySwitch?: PaymentServerResponse<JavaPaymentSwitchInfo>;
    paySettlement?: PaymentServerResponse<unknown>;
  };
  modules: {
    orderPayInfo: JavaOrderPayInfo;
    paySwitch?: JavaPaymentSwitchInfo;
    paySettlementType: number;
  };
  view: CashierViewData;
};

export type CashierViewData = {
  amountText: string;
  defaultPayType: 7 | 8;
  dvyType: string;
  endTime: string;
  isPurePoints: boolean;
  methods: CashierPaymentMethod[];
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
  paySettlementType: number;
  status: "failed" | "paid" | "pending" | "unknown";
  statusText: string;
  totalAmount: number;
  totalScore: number;
};

export type PaymentExecution =
  | {
      type: "native-sdk";
      bizOrderNo?: string;
      miniProgram?: PaymentMiniProgramPayload;
      orderNumbers: string;
      paymentMode?: "app-sdk" | "wechat-mini-program";
      payType: 7 | 8;
      paymentPayload: unknown;
      provider: "alipay" | "wechat" | "allinpay";
      settlementProvider?: "allinpay";
    }
  | {
      type: "open-url";
      bizOrderNo?: string;
      orderNumbers: string;
      provider: "allinpay" | "alipay" | "wechat";
      url: string;
    }
  | {
      type: "paid";
      orderNumbers: string;
      reason: "pure-points";
    };

export type PaymentMiniProgramPayload = {
  appId: string;
  originalId: string;
  path: string;
  query: Record<string, string>;
  queryString: string;
  type: "wechat";
};

export type OrderPaymentData = {
  debugRaw?: {
    allinpayUrl?: PaymentServerResponse<string>;
    orderPayRequest?: Record<string, unknown>;
    orderPay: PaymentServerResponse<JavaOrderPayResult>;
    paySettlement?: PaymentServerResponse<unknown>;
  };
  modules: {
    allinpayUrl?: string;
    orderPay: JavaOrderPayResult;
    paySettlementType: number;
  };
  view: {
    execution: PaymentExecution;
    orderNumbers: string;
    paySettlementType: number;
    payType: 7 | 8 | 0;
  };
};

export type AllinpayOrderStatusData = {
  debugRaw?: {
    allinpayStatus: PaymentServerResponse<JavaAllinpayOrderStatus>;
  };
  modules: {
    allinpayStatus: JavaAllinpayOrderStatus;
  };
  view: {
    bizOrderNo: string;
    normalizedStatus: "failed" | "paid" | "pending" | "unknown";
    orderNumbers?: string;
    statusText: string;
  };
};

export type FetchOrderPayInfoOptions = {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: CashierBackendClient;
  clientContext?: ClientRequestContext;
  dvyType?: string;
  includeDebugRaw?: boolean;
  isPurePoints?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
};

export async function fetchOrderPayInfoData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  dvyType = "1",
  includeDebugRaw = false,
  isPurePoints,
  orderNumbers,
  orderType = "0",
  ordermold = "0"
}: FetchOrderPayInfoOptions): Promise<BackendApiResult<OrderPayInfoData>> {
  const result = await backendClient.request<PaymentServerResponse<JavaOrderPayInfo>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/order/getOrderPayInfoByOrderNumber?${new URLSearchParams({ orderNumbers }).toString()}`,
    route: "/pay-way"
  });
  if (!result.ok) {
    return result;
  }

  const orderPayInfo = unwrapJavaData(result.data, result.meta.requestId, "订单支付信息获取失败。");
  if (!orderPayInfo.ok) {
    return orderPayInfo;
  }

  const paySwitchResult = await backendClient.request<PaymentServerResponse<JavaPaymentSwitchInfo>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/sys/config/info/getSysPaySwitch",
    route: "/pay-way"
  });
  const paySwitch = paySwitchResult.ok && paySwitchResult.data.success !== false && paySwitchResult.data.data ? paySwitchResult.data.data : undefined;

  const paySettlementResult = await fetchPaySettlementType({
    authRequired,
    authToken,
    backendClient,
    clientContext,
    route: "/pay-way"
  });
  const paySettlementType = paySettlementResult.ok ? paySettlementResult.data.paySettlementType : 0;

  return {
    ok: true,
    data: createOrderPayInfoBffData({
      dvyType,
      isPurePoints,
      orderNumbers,
      orderPayInfo: orderPayInfo.data,
      orderType,
      ordermold,
      raw: includeDebugRaw ? result.data : undefined,
      rawPaySwitch: includeDebugRaw && paySwitchResult.ok ? paySwitchResult.data : undefined,
      rawPaySettlement: includeDebugRaw && paySettlementResult.ok ? paySettlementResult.data.raw : undefined,
      paySettlementType,
      paySwitch
    }),
    meta: result.meta
  };
}

export function createOrderPayInfoBffData({
  dvyType = "1",
  isPurePoints,
  orderNumbers,
  orderPayInfo,
  orderType = "0",
  ordermold = "0",
  paySwitch,
  paySettlementType = 0,
  raw,
  rawPaySettlement,
  rawPaySwitch
}: {
  dvyType?: string;
  isPurePoints?: string;
  orderNumbers: string;
  orderPayInfo: JavaOrderPayInfo;
  orderType?: string;
  ordermold?: string;
  paySwitch?: JavaPaymentSwitchInfo;
  paySettlementType?: number;
  raw?: PaymentServerResponse<JavaOrderPayInfo>;
  rawPaySettlement?: PaymentServerResponse<unknown>;
  rawPaySwitch?: PaymentServerResponse<JavaPaymentSwitchInfo>;
}): OrderPayInfoData {
  const methods = normalizePaymentMethods(paySwitch);
  const totalAmount = normalizeMoney(orderPayInfo.totalFee, 0);

  return {
    ...(raw === undefined
      ? {}
      : {
          debugRaw: {
            orderPayInfo: raw,
            ...(rawPaySettlement === undefined ? {} : { paySettlement: rawPaySettlement }),
            ...(rawPaySwitch === undefined ? {} : { paySwitch: rawPaySwitch })
          }
        }),
    modules: {
      orderPayInfo,
      paySettlementType,
      ...(paySwitch === undefined ? {} : { paySwitch })
    },
    view: {
      amountText: formatAmount(totalAmount),
      defaultPayType: resolveDefaultPayType(methods),
      dvyType,
      endTime: normalizeText(orderPayInfo.endTime, ""),
      isPurePoints: isPurePoints === "1" || totalAmount <= 0,
      methods,
      orderNumbers,
      orderType,
      ordermold,
      paySettlementType,
      status: normalizeOrderPayStatus(orderPayInfo.status),
      statusText: normalizeOrderPayStatusText(orderPayInfo.status),
      totalAmount,
      totalScore: normalizeMoney(orderPayInfo.totalScore, 0)
    }
  };
}

export async function createOrderPaymentData({
  authRequired = false,
  authToken,
  backendClient,
  clientContext,
  dvyType = "1",
  includeDebugRaw = false,
  isPurePoints = false,
  orderNumbers,
  orderType = "0",
  ordermold = "0",
  payType,
  returnUrl
}: {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: CashierBackendClient;
  clientContext?: ClientRequestContext;
  dvyType?: string;
  includeDebugRaw?: boolean;
  isPurePoints?: boolean;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
  payType: 7 | 8 | 0;
  returnUrl: string;
}): Promise<BackendApiResult<OrderPaymentData>> {
  void dvyType;
  void orderType;
  void ordermold;
  if (isPurePoints || payType === 0) {
    return {
      ok: true,
      data: {
        modules: {
          orderPay: {},
          paySettlementType: 0
        },
        view: {
          execution: {
            orderNumbers,
            reason: "pure-points",
            type: "paid"
          },
          orderNumbers,
          paySettlementType: 0,
          payType: 0
        }
      },
      meta: {
        appEnv: "unknown",
        backend: "java",
        h5Version: "unknown",
        requestId: "local-pure-points",
        route: "/api/bff/order-pay"
      }
    };
  }

  const paySettlementResult = await fetchPaySettlementType({
    authRequired,
    authToken,
    backendClient,
    clientContext,
    route: "/api/bff/order-pay"
  });
  if (!paySettlementResult.ok) {
    return paySettlementResult;
  }

  const paySettlementType = paySettlementResult.data.paySettlementType;
  const orderPayRequestBody = {
    payType,
    orderNumbers,
    returnUrl,
    systemType: resolveJavaSystemType(clientContext),
    ...(paySettlementType === 1 ? { allinPaySystemType: 1 } : {})
  };
  console.info(
    "[h5-order-pay-java-request]",
    JSON.stringify(
      {
        body: orderPayRequestBody,
        path: "/p/order/pay",
        paySettlementType
      },
      null,
      2
    )
  );
  const orderPayResult = await backendClient.request<PaymentServerResponse<JavaOrderPayResult>>({
    authRequired,
    authToken,
    backend: "java",
    body: orderPayRequestBody,
    clientContext,
    method: "POST",
    path: "/p/order/pay",
    route: "/api/bff/order-pay"
  });
  console.info(
    "[h5-order-pay-java-response]",
    JSON.stringify(
      orderPayResult.ok
        ? {
            data: orderPayResult.data,
            ok: true,
            requestId: orderPayResult.meta.requestId
          }
        : {
            error: orderPayResult.error,
            ok: false
          },
      null,
      2
    )
  );
  if (!orderPayResult.ok) {
    return orderPayResult;
  }

  const orderPay = unwrapJavaData(orderPayResult.data, orderPayResult.meta.requestId, "支付申请失败。");
  if (!orderPay.ok) {
    return orderPay;
  }

  if (paySettlementType === 1 && payType === 7 && isRecord(orderPay.data) && orderPay.data.miniprogramPayInfo_VSP) {
    const allinpayUrlResult = await backendClient.request<PaymentServerResponse<string>>({
      authRequired,
      authToken,
      backend: "java",
      clientContext,
      method: "GET",
      path: `/p/allinpay/order/getAliAppPayUrl?${new URLSearchParams({
        json: stringifyPaymentField(orderPay.data.miniprogramPayInfo_VSP),
        page: "pages/orderDetail/orderDetail",
        schemeUrl: `${process.env.NEXT_PUBLIC_APP_URL_SCHEMES ?? process.env.H5_APP_URL_SCHEMES ?? "meumall"}://app/`
      }).toString()}`,
      route: "/api/bff/order-pay"
    });
    if (!allinpayUrlResult.ok) {
      return allinpayUrlResult;
    }
    const allinpayUrl = unwrapJavaData(allinpayUrlResult.data, allinpayUrlResult.meta.requestId, "通联支付链接获取失败。");
    if (!allinpayUrl.ok) {
      return allinpayUrl;
    }

    return {
      ok: true,
      data: {
        ...(includeDebugRaw
          ? {
            debugRaw: {
              allinpayUrl: allinpayUrlResult.data,
              orderPayRequest: orderPayRequestBody,
              orderPay: orderPayResult.data,
              paySettlement: paySettlementResult.data.raw
            }
            }
          : {}),
        modules: {
          allinpayUrl: allinpayUrl.data,
          orderPay: orderPay.data,
          paySettlementType
        },
        view: {
          execution: {
            bizOrderNo: normalizeOptionalText(orderPay.data.bizOrderNo),
            orderNumbers,
            provider: "allinpay",
            type: "open-url",
            url: allinpayUrl.data
          },
          orderNumbers,
          paySettlementType,
          payType
        }
      },
      meta: orderPayResult.meta
    };
  }

  return {
    ok: true,
    data: {
      ...(includeDebugRaw
        ? {
            debugRaw: {
              orderPayRequest: orderPayRequestBody,
              orderPay: orderPayResult.data,
              paySettlement: paySettlementResult.data.raw
            }
          }
        : {}),
      modules: {
        orderPay: orderPay.data,
        paySettlementType
      },
      view: {
        execution: normalizePaymentExecution({
          orderNumbers,
          payResult: orderPay.data,
          paySettlementType,
          payType
        }),
        orderNumbers,
        paySettlementType,
        payType
      }
    },
    meta: orderPayResult.meta
  };
}

export async function fetchAllinpayOrderStatusData({
  authRequired = false,
  authToken,
  backendClient,
  bizOrderNo,
  clientContext,
  includeDebugRaw = false,
  orderNumbers
}: {
  authRequired?: boolean;
  authToken?: string | null;
  backendClient: CashierBackendClient;
  bizOrderNo: string;
  clientContext?: ClientRequestContext;
  includeDebugRaw?: boolean;
  orderNumbers?: string;
}): Promise<BackendApiResult<AllinpayOrderStatusData>> {
  const result = await backendClient.request<PaymentServerResponse<JavaAllinpayOrderStatus>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: `/p/allinpay/order/getOrderStatus?${new URLSearchParams({ bizOrderNo }).toString()}`,
    route: "/api/bff/allinpay-order-status"
  });
  if (!result.ok) {
    return result;
  }

  const status = unwrapJavaData(result.data, result.meta.requestId, "通联支付状态获取失败。");
  if (!status.ok) {
    return status;
  }

  const normalizedStatus = normalizeAllinpayOrderStatus(status.data.orderStatus);

  return {
    ok: true,
    data: {
      ...(includeDebugRaw
        ? {
            debugRaw: {
              allinpayStatus: result.data
            }
          }
        : {}),
      modules: {
        allinpayStatus: status.data
      },
      view: {
        bizOrderNo,
        normalizedStatus,
        ...(orderNumbers ? { orderNumbers } : {}),
        statusText: normalizePaymentResultStatusText(normalizedStatus)
      }
    },
    meta: result.meta
  };
}

function normalizePaymentMethods(paySwitch?: JavaPaymentSwitchInfo): CashierPaymentMethod[] {
  const switchInfo = paySwitch ?? { aliPaySwitch: true, wxPaySwitch: true };
  return [
    ...(switchInfo.aliPaySwitch ? [{ id: "aliPay" as const, label: "支付宝支付", payType: 7 as const }] : []),
    ...(switchInfo.wxPaySwitch ? [{ id: "wechatPay" as const, label: "微信支付", payType: 8 as const }] : [])
  ];
}

function resolveDefaultPayType(methods: CashierPaymentMethod[]): 7 | 8 {
  return methods.find((method) => method.payType === 8)?.payType ?? methods[0]?.payType ?? 7;
}

function normalizeOrderPayStatus(status: unknown): CashierViewData["status"] {
  if (status === 1) {
    return "pending";
  }
  if (status === 2 || status === 3 || status === 4 || status === 5 || status === 7) {
    return "paid";
  }
  if (typeof status === "number") {
    return "failed";
  }
  return "unknown";
}

function normalizeOrderPayStatusText(status: unknown) {
  const normalized = normalizeOrderPayStatus(status);
  if (normalized === "pending") {
    return "待支付";
  }
  if (normalized === "paid") {
    return "已支付";
  }
  if (normalized === "failed") {
    return "支付失败";
  }
  return "状态未知";
}

async function fetchPaySettlementType({
  authRequired,
  authToken,
  backendClient,
  clientContext,
  route
}: {
  authRequired: boolean;
  authToken?: string | null;
  backendClient: CashierBackendClient;
  clientContext?: ClientRequestContext;
  route: string;
}): Promise<BackendApiResult<{ paySettlementType: number; raw: PaymentServerResponse<unknown> }>> {
  const result = await backendClient.request<PaymentServerResponse<unknown>>({
    authRequired,
    authToken,
    backend: "java",
    clientContext,
    method: "GET",
    path: "/sys/config/paySettlementType",
    route
  });
  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: {
      paySettlementType: normalizePaySettlementType(result.data.data),
      raw: result.data
    },
    meta: result.meta
  };
}

function normalizePaySettlementType(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (isRecord(value)) {
    return normalizePaySettlementType(value.paySettlementType);
  }
  if (typeof value === "string") {
    try {
      return normalizePaySettlementType(JSON.parse(value));
    } catch {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

function normalizePaymentExecution({
  orderNumbers,
  payResult,
  paySettlementType,
  payType
}: {
  orderNumbers: string;
  payResult: JavaOrderPayResult;
  paySettlementType: number;
  payType: 7 | 8;
}): PaymentExecution {
  const provider = payType === 7 ? "alipay" : "wechat";
  const allinpayWechatMiniProgram = paySettlementType === 1 && payType === 8 ? createAllinpayWechatMiniProgramPayload(payResult) : undefined;
  if (allinpayWechatMiniProgram) {
    return {
      bizOrderNo: extractBizOrderNo(payResult),
      miniProgram: allinpayWechatMiniProgram.miniProgram,
      orderNumbers,
      paymentMode: "wechat-mini-program",
      paymentPayload: allinpayWechatMiniProgram.rawPayload,
      payType,
      provider: "allinpay",
      settlementProvider: "allinpay",
      type: "native-sdk"
    };
  }

  if (typeof payResult === "string" && looksLikeUrl(payResult)) {
    return {
      orderNumbers,
      provider: paySettlementType === 1 ? "allinpay" : provider,
      type: "open-url",
      url: payResult
    };
  }

  if (isRecord(payResult)) {
    const url = firstString(payResult.payUrl, payResult.url, payResult.payInfoUrl, payResult.targetUrl);
    if (url && looksLikeUrl(url)) {
      return {
        bizOrderNo: normalizeOptionalText(payResult.bizOrderNo),
        orderNumbers,
        provider: paySettlementType === 1 ? "allinpay" : provider,
        type: "open-url",
        url
      };
    }
  }

  return {
    orderNumbers,
    paymentPayload: payType === 8 ? normalizeWechatAppPayInfo(payResult) : payResult,
    paymentMode: "app-sdk",
    payType,
    provider,
    type: "native-sdk"
  };
}

function createAllinpayWechatMiniProgramPayload(payResult: JavaOrderPayResult) {
  const rawPayload = extractAllinpayWechatPayload(payResult);
  if (!rawPayload) {
    return undefined;
  }

  const query = normalizeStringRecord(rawPayload);
  const queryString = new URLSearchParams(query).toString();
  return {
    rawPayload,
    miniProgram: {
      appId: "wxef277996acc166c3",
      originalId: "gh_e64a1a89a0ad",
      path: queryString ? `pages/orderDetail/orderDetail?${queryString}` : "pages/orderDetail/orderDetail",
      query,
      queryString,
      type: "wechat" as const
    }
  };
}

function extractAllinpayWechatPayload(payResult: JavaOrderPayResult) {
  if (!isRecord(payResult)) {
    return undefined;
  }
  const explicitCandidate =
    payResult.miniprogramPayInfo_VSP ??
    payResult.miniprogramPayInfo ??
    payResult.miniProgramPayInfo ??
    payResult.payInfo ??
    payResult.wxPayInfo;
  const parsedExplicitCandidate = parsePaymentObject(explicitCandidate);
  if (parsedExplicitCandidate) {
    return parsedExplicitCandidate;
  }

  return hasAllinpayMiniProgramKeys(payResult) ? payResult : undefined;
}

function parsePaymentObject(value: unknown): Record<string, unknown> | undefined {
  if (isRecord(value)) {
    return value;
  }
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function normalizeStringRecord(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== "")
      .map(([key, entryValue]) => [key, typeof entryValue === "string" ? entryValue : String(entryValue)])
  );
}

function hasAllinpayMiniProgramKeys(value: Record<string, unknown>) {
  return ["cusid", "appid", "trxamt", "reqsn"].some((key) => value[key] !== undefined && value[key] !== null);
}

function extractBizOrderNo(payResult: JavaOrderPayResult) {
  if (!isRecord(payResult)) {
    return undefined;
  }
  return normalizeOptionalText(payResult.bizOrderNo ?? payResult.orderNo ?? payResult.orderNumber);
}

function normalizeWechatAppPayInfo(payResult: JavaOrderPayResult): unknown {
  if (!isRecord(payResult)) {
    return payResult;
  }
  return {
    appid: payResult.appId ?? payResult.appid,
    noncestr: payResult.nonceStr ?? payResult.noncestr,
    package: payResult.packageValue ?? payResult.package,
    partnerid: payResult.partnerId ?? payResult.partnerid,
    prepayid: payResult.prepayId ?? payResult.prepayid,
    sign: payResult.sign,
    timestamp: payResult.timeStamp ?? payResult.timestamp
  };
}

function normalizeAllinpayOrderStatus(status: unknown): AllinpayOrderStatusData["view"]["normalizedStatus"] {
  if (status === 4) {
    return "paid";
  }
  if (status === 99 || status === 1) {
    return "pending";
  }
  if (status === 3) {
    return "failed";
  }
  return "unknown";
}

export function normalizePaymentResultStatusText(status: "failed" | "paid" | "pending" | "unknown") {
  if (status === "paid") {
    return "支付成功";
  }
  if (status === "failed") {
    return "支付失败";
  }
  if (status === "pending") {
    return "支付处理中";
  }
  return "支付状态未知";
}

function resolveJavaSystemType(clientContext?: ClientRequestContext) {
  const platform = clientContext?.platform?.toLowerCase();
  if (platform === "android") {
    return 4;
  }
  return 5;
}

function unwrapJavaData<T>(response: PaymentServerResponse<T>, requestId: string, fallbackMessage: string): BackendApiResult<T> {
  if (response.success === false) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { code: response.code },
        message: response.msg ?? fallbackMessage,
        requestId
      })
    };
  }

  if (!response.data) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { code: response.code },
        message: response.msg ?? fallbackMessage,
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
      route: "/pay-way"
    }
  };
}

function normalizeMoney(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/g, "").replace(/\.$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringifyPaymentField(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
}

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|[a-z][a-z0-9+.-]*:\/\/)/i.test(value);
}
