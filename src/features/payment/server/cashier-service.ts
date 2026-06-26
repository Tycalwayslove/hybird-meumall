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

export type CashierPaymentMethod = {
  id: "aliPay" | "wechatPay";
  label: string;
  payType: 7 | 8;
};

export type OrderPayInfoData = {
  debugRaw?: {
    orderPayInfo: PaymentServerResponse<JavaOrderPayInfo>;
    paySwitch?: PaymentServerResponse<JavaPaymentSwitchInfo>;
  };
  modules: {
    orderPayInfo: JavaOrderPayInfo;
    paySwitch?: JavaPaymentSwitchInfo;
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
  status: "failed" | "paid" | "pending" | "unknown";
  statusText: string;
  totalAmount: number;
  totalScore: number;
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
  raw,
  rawPaySwitch
}: {
  dvyType?: string;
  isPurePoints?: string;
  orderNumbers: string;
  orderPayInfo: JavaOrderPayInfo;
  orderType?: string;
  ordermold?: string;
  paySwitch?: JavaPaymentSwitchInfo;
  raw?: PaymentServerResponse<JavaOrderPayInfo>;
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
            ...(rawPaySwitch === undefined ? {} : { paySwitch: rawPaySwitch })
          }
        }),
    modules: {
      orderPayInfo,
      ...(paySwitch === undefined ? {} : { paySwitch })
    },
    view: {
      amountText: formatAmount(totalAmount),
      defaultPayType: methods[0]?.payType ?? 7,
      dvyType,
      endTime: normalizeText(orderPayInfo.endTime, ""),
      isPurePoints: isPurePoints === "1" || totalAmount <= 0,
      methods,
      orderNumbers,
      orderType,
      ordermold,
      status: normalizeOrderPayStatus(orderPayInfo.status),
      statusText: normalizeOrderPayStatusText(orderPayInfo.status),
      totalAmount,
      totalScore: normalizeMoney(orderPayInfo.totalScore, 0)
    }
  };
}

function normalizePaymentMethods(paySwitch?: JavaPaymentSwitchInfo): CashierPaymentMethod[] {
  const switchInfo = paySwitch ?? { aliPaySwitch: true, wxPaySwitch: true };
  return [
    ...(switchInfo.aliPaySwitch ? [{ id: "aliPay" as const, label: "支付宝支付", payType: 7 as const }] : []),
    ...(switchInfo.wxPaySwitch ? [{ id: "wechatPay" as const, label: "微信支付", payType: 8 as const }] : [])
  ];
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

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/g, "").replace(/\.$/, "");
}
