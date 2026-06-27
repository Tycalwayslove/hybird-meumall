import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

export type OrderStatus = "all" | "pending-payment" | "pending-shipment" | "pending-receipt" | "completed";
export type OrderCardStatus = Exclude<OrderStatus, "all"> | "cancelled" | "grouping" | "review";

export type OrderAction = {
  id: "cancel" | "contact" | "delete" | "logistics" | "pay" | "receipt";
  label: string;
  tone: "neutral" | "primary";
};

export type OrderProductView = {
  afterSaleTags: string[];
  imageUrl?: string;
  itemId?: string;
  price: number;
  prodId: string;
  properties: string;
  quantity: number;
  refundSn?: string;
  skuId?: string;
  title: string;
};

export type OrderCardView = {
  actions: OrderAction[];
  detailHref: string;
  dvyType?: number;
  items: OrderProductView[];
  orderNumber: string;
  orderType?: number;
  refundStatusTexts: string[];
  shopName: string;
  status: OrderCardStatus;
  statusLabel: string;
  totalAmount: number;
  totalCount: number;
};

export type RefundCardView = {
  applyTime: string;
  detailHref: string;
  items: OrderProductView[];
  refundAmount: number;
  refundSn: string;
  shopName: string;
  statusLabel: string;
};

export type OrderMutationData = {
  modules: {
    raw: unknown;
  };
  view: {
    message: string;
    status: "ok";
  };
};

export type RefundDetailView = RefundCardView & {
  orderNumber: string;
};

export type OrdersPageData<TModules> = {
  modules: TModules;
  page: {
    current: number;
    hasMore: boolean;
    pages: number;
    size: number;
    total: number;
  };
};

export type JavaOrderEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
};

type OrdersBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export function mapOrderStatusToJavaStatus(status: OrderStatus): number {
  const statusMap: Record<OrderStatus, number> = {
    all: 0,
    completed: 5,
    "pending-payment": 1,
    "pending-receipt": 3,
    "pending-shipment": 2
  };
  return statusMap[status] ?? 0;
}

export async function fetchOrderListData({
  authToken,
  backendClient
  , current = 1,
  javaOssAssetBaseUrl,
  keyword,
  route,
  size = 10,
  status = "all"
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  keyword?: string;
  route: string;
  size?: number;
  status?: OrderStatus;
}): Promise<BackendApiResult<OrdersPageData<{ orderPage: JavaPage<JavaOrder> }> & { view: { orders: OrderCardView[] } }>> {
  const query = new URLSearchParams({
    current: String(normalizePositiveInteger(current, 1)),
    size: String(normalizePositiveInteger(size, 10)),
    status: String(mapOrderStatusToJavaStatus(status))
  });
  if (keyword) {
    query.set("prodName", keyword);
  }
  const response = await backendClient.request<JavaOrderEnvelope<JavaPage<JavaOrder>>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/myOrder/myOrder?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "订单列表获取失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const orderPage = normalizePage(envelope.data);

  return {
    ok: true,
    data: {
      modules: {
        orderPage
      },
      page: mapPage(orderPage),
      view: {
        orders: orderPage.records.map((order) => mapJavaOrderToCard(order, { javaOssAssetBaseUrl }))
      }
    },
    meta: response.meta
  };
}

export async function fetchRefundOrderListData({
  authToken,
  backendClient
  , current = 1,
  javaOssAssetBaseUrl,
  route,
  size = 10
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  current?: number;
  javaOssAssetBaseUrl?: string;
  route: string;
  size?: number;
}): Promise<BackendApiResult<OrdersPageData<{ refundPage: JavaPage<JavaRefundOrder> }> & { view: { refunds: RefundCardView[] } }>> {
  const query = new URLSearchParams({
    current: String(normalizePositiveInteger(current, 1)),
    size: String(normalizePositiveInteger(size, 10)),
    startTime: "",
    endTime: ""
  });
  const response = await backendClient.request<JavaOrderEnvelope<JavaPage<JavaRefundOrder>>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/orderRefund/list?${query.toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "退货退款列表获取失败。");
  if (!envelope.ok) {
    return envelope;
  }
  const refundPage = normalizePage(envelope.data);

  return {
    ok: true,
    data: {
      modules: {
        refundPage
      },
      page: mapPage(refundPage),
      view: {
        refunds: refundPage.records.map((refund) => mapJavaRefundToCard(refund, { javaOssAssetBaseUrl }))
      }
    },
    meta: response.meta
  };
}

export async function fetchOrderDetailData({
  authToken,
  backendClient,
  javaOssAssetBaseUrl,
  orderNumber,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  javaOssAssetBaseUrl?: string;
  orderNumber: string;
  route: string;
}): Promise<BackendApiResult<{ modules: { deliveryInfo?: JavaDeliveryInfo; orderDetail: JavaOrderDetail }; view: OrderDetailView }>> {
  const response = await backendClient.request<JavaOrderEnvelope<JavaOrderDetail>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/myOrder/orderDetail?${new URLSearchParams({ orderNumber }).toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "订单详情获取失败。");
  if (!envelope.ok) {
    return envelope;
  }

  const deliveryResponse = await backendClient.request<JavaOrderEnvelope<JavaDeliveryInfo[]>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/myDelivery/orderInfo/${encodeURIComponent(orderNumber)}`,
    route
  });

  const deliveryInfo =
    deliveryResponse.ok && isJavaSuccess(deliveryResponse.data) && Array.isArray(deliveryResponse.data.data) ? deliveryResponse.data.data[0] : undefined;

  return {
    ok: true,
    data: {
      modules: {
        deliveryInfo,
        orderDetail: envelope.data
      },
      view: mapJavaOrderToDetail(envelope.data, deliveryInfo, { javaOssAssetBaseUrl })
    },
    meta: response.meta
  };
}

export function cancelOrder(options: OrderActionOptions) {
  return mutateOrder({
    ...options,
    method: "PUT",
    path: `/p/myOrder/cancel/${encodeURIComponent(options.orderNumber)}`,
    successMessage: "订单已取消。"
  });
}

export function receiptOrder(options: OrderActionOptions) {
  return mutateOrder({
    ...options,
    method: "PUT",
    path: `/p/myOrder/receipt/${encodeURIComponent(options.orderNumber)}`,
    successMessage: "已确认收货。"
  });
}

export function deleteOrder(options: OrderActionOptions) {
  return mutateOrder({
    ...options,
    method: "DELETE",
    path: `/p/myOrder/${encodeURIComponent(options.orderNumber)}`,
    successMessage: "订单已删除。"
  });
}

export function submitContactMessage({
  authToken,
  backendClient,
  messageContent,
  orderNumber,
  route,
  userMobile
}: OrderActionOptions & { messageContent: string; userMobile: string }) {
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      messageContent,
      orderNumber,
      userMobile
    },
    method: "POST",
    path: "/p/myOrder/submitMessage",
    route,
    successMessage: "留言已提交。"
  });
}

export async function fetchRefundDetailData({
  authToken,
  backendClient,
  javaOssAssetBaseUrl,
  refundSn,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  javaOssAssetBaseUrl?: string;
  refundSn: string;
  route: string;
}): Promise<BackendApiResult<{ modules: { refundDetail: JavaRefundDetail }; view: RefundDetailView }>> {
  const response = await backendClient.request<JavaOrderEnvelope<JavaRefundDetail>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/orderRefund/info?${new URLSearchParams({ refundSn }).toString()}`,
    route
  });
  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "退款详情获取失败。");
  if (!envelope.ok) {
    return envelope;
  }

  return {
    ok: true,
    data: {
      modules: {
        refundDetail: envelope.data
      },
      view: {
        ...mapJavaRefundToCard(envelope.data, { javaOssAssetBaseUrl }),
        orderNumber: normalizeText(envelope.data.orderNumber, "")
      }
    },
    meta: response.meta
  };
}

export type JavaPage<T> = {
  current?: number;
  pages?: number;
  records?: T[];
  size?: number;
  total?: number;
};

export type JavaOrderItem = {
  afterSaleType?: string | null;
  commSts?: number | null;
  orderItemId?: number | string | null;
  pic?: string | null;
  price?: number | string | null;
  prodCount?: number | string | null;
  prodId?: number | string | null;
  prodName?: string | null;
  properties?: string | null;
  refundSn?: string | null;
  returnMoneySts?: number | string | null;
  skuId?: number | string | null;
};

export type JavaOrder = {
  actualTotal?: number | string | null;
  deliveryCount?: number | string | null;
  dvyType?: number | string | null;
  orderItemDtos?: JavaOrderItem[];
  orderMold?: number | string | null;
  orderNumber?: string | null;
  orderType?: number | string | null;
  productNums?: number | string | null;
  refundStatus?: number | string | null;
  returnMoneySts?: number | string | null;
  shopId?: number | string | null;
  shopName?: string | null;
  status?: number | string | null;
  userScore?: number | string | null;
};

export type JavaOrderDetail = JavaOrder & {
  canAllRefund?: boolean;
  canRefund?: boolean;
  createTime?: string | null;
  freeTransfee?: number | string | null;
  orderScore?: number | string | null;
  payTime?: string | null;
  platformCouponAmount?: number | string | null;
  scoreAmount?: number | string | null;
  shopCouponMoney?: number | string | null;
  total?: number | string | null;
  transfee?: number | string | null;
  userAddrDto?: {
    addr?: string | null;
    area?: string | null;
    city?: string | null;
    mobile?: string | null;
    province?: string | null;
    receiver?: string | null;
  } | null;
};

export type JavaRefundOrder = {
  applyTime?: string | null;
  orderItemDtos?: JavaOrderItem[];
  orderItems?: JavaOrderItem[];
  refundAmount?: number | string | null;
  refundSn?: string | null;
  refundStatus?: number | string | null;
  shopName?: string | null;
};

export type JavaRefundDetail = JavaRefundOrder & {
  orderNumber?: string | null;
};

export type JavaDeliveryInfo = {
  deliveryDto?: {
    state?: number | string | null;
    traces?: Array<{
      acceptStation?: string | null;
      acceptTime?: string | null;
    }>;
  } | null;
};

type OrderActionOptions = {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  orderNumber: string;
  route: string;
};

async function mutateOrder({
  authToken,
  backendClient,
  body,
  method,
  path,
  route,
  successMessage
}: Omit<OrderActionOptions, "orderNumber"> & { body?: unknown; method: "DELETE" | "POST" | "PUT"; path: string; successMessage: string }): Promise<BackendApiResult<OrderMutationData>> {
  const response = await backendClient.request<JavaOrderEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    ...(body === undefined ? {} : { body }),
    method,
    path,
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, successMessage);
  if (!envelope.ok) {
    return envelope;
  }

  return {
    ok: true,
    data: {
      modules: {
        raw: envelope.data
      },
      view: {
        message: typeof envelope.data === "string" ? envelope.data : response.data.msg ?? successMessage,
        status: "ok"
      }
    },
    meta: response.meta
  };
}

export type OrderDetailView = {
  actions: OrderAction[];
  address: string;
  canRenderAsOrdinaryExpress: boolean;
  contactName: string;
  contactPhone: string;
  createTime: string;
  delivery?: {
    latestTime: string;
    latestTrace: string;
    stateLabel: string;
  };
  feeRows: Array<{ label: string; value: string }>;
  items: OrderProductView[];
  orderNumber: string;
  payTime: string;
  refundStatusTexts: string[];
  shopName: string;
  status: OrderCardStatus;
  statusLabel: string;
  totalAmount: number;
};

function mapJavaOrderToCard(order: JavaOrder, options: { javaOssAssetBaseUrl?: string } = {}): OrderCardView {
  const status = normalizeOrderCardStatus(order.status);
  const orderNumber = normalizeText(order.orderNumber, "");
  const items = normalizeOrderItems(order.orderItemDtos, options);

  return {
    actions: getOrderActionButtons(order),
    detailHref: `/orders/${encodeURIComponent(orderNumber)}`,
    dvyType: normalizeOptionalNumber(order.dvyType),
    items,
    orderNumber,
    orderType: normalizeOptionalNumber(order.orderType),
    refundStatusTexts: getRefundStatusTexts(order),
    shopName: normalizeText(order.shopName, "官方店铺"),
    status,
    statusLabel: getOrderStatusLabel(order.status),
    totalAmount: normalizeMoney(order.actualTotal, 0),
    totalCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

function mapJavaRefundToCard(refund: JavaRefundOrder, options: { javaOssAssetBaseUrl?: string } = {}): RefundCardView {
  const refundSn = normalizeText(refund.refundSn, "");
  const items = refund.orderItems ?? refund.orderItemDtos;

  return {
    applyTime: normalizeText(refund.applyTime, ""),
    detailHref: `/refunds/${encodeURIComponent(refundSn)}`,
    items: normalizeOrderItems(items, options),
    refundAmount: normalizeMoney(refund.refundAmount, 0),
    refundSn,
    shopName: normalizeText(refund.shopName, "官方店铺"),
    statusLabel: getRefundListStatusLabel(refund.refundStatus)
  };
}

function mapJavaOrderToDetail(order: JavaOrderDetail, deliveryInfo?: JavaDeliveryInfo, options: { javaOssAssetBaseUrl?: string } = {}): OrderDetailView {
  const card = mapJavaOrderToCard(order, options);
  const address = order.userAddrDto;
  const deliveryDto = deliveryInfo?.deliveryDto;
  const latestTrace = Array.isArray(deliveryDto?.traces) ? [...deliveryDto.traces].reverse()[0] : undefined;

  return {
    actions: card.actions,
    address: [address?.province, address?.city, address?.area, address?.addr].filter(Boolean).join(""),
    canRenderAsOrdinaryExpress: normalizeNumber(order.orderMold, 0) !== 1 && normalizeNumber(order.dvyType, 1) !== 2,
    contactName: normalizeText(address?.receiver, ""),
    contactPhone: maskPhone(normalizeText(address?.mobile, "")),
    createTime: normalizeText(order.createTime, ""),
    ...(latestTrace
      ? {
          delivery: {
            latestTime: normalizeText(latestTrace.acceptTime, ""),
            latestTrace: normalizeText(latestTrace.acceptStation, ""),
            stateLabel: getDeliveryStateLabel(deliveryDto?.state)
          }
        }
      : {}),
    feeRows: [
      { label: "商品总额", value: formatMoney(order.total ?? order.actualTotal) },
      { label: "运费", value: formatMoney(order.transfee) },
      { label: "运费减免", value: formatDiscount(order.freeTransfee) },
      { label: "平台优惠", value: formatDiscount(order.platformCouponAmount) },
      { label: "积分抵扣", value: formatDiscount(order.scoreAmount) },
      { label: "店铺优惠", value: formatDiscount(order.shopCouponMoney) },
      { label: "实付款", value: formatMoney(order.actualTotal) }
    ],
    items: card.items,
    orderNumber: card.orderNumber,
    payTime: normalizeText(order.payTime, ""),
    refundStatusTexts: card.refundStatusTexts,
    shopName: card.shopName,
    status: card.status,
    statusLabel: card.statusLabel,
    totalAmount: card.totalAmount
  };
}

function getOrderActionButtons(order: JavaOrder): OrderAction[] {
  const status = normalizeNumber(order.status, 0);
  const refundStatus = normalizeNumber(order.refundStatus, 0);
  const returnMoneySts = normalizeNullableNumber(order.returnMoneySts);
  const dvyType = normalizeNumber(order.dvyType, 1);
  const actions: OrderAction[] = [];

  if (status === 1) {
    actions.push({ id: "cancel", label: "取消订单", tone: "neutral" });
    actions.push({ id: "pay", label: "继续付款", tone: "primary" });
  }
  if (status === 3 && refundStatus !== 1) {
    actions.push({ id: "receipt", label: "确认收货", tone: "primary" });
  }
  if ((status === 3 || status === 5 || (status === 2 && normalizeNumber(order.deliveryCount, 0) > 0)) && (dvyType === 1 || dvyType === 0)) {
    actions.push({ id: "logistics", label: "查看物流", tone: "neutral" });
  }
  if ((status === 5 || status === 6) && (returnMoneySts === null || returnMoneySts > 4 || returnMoneySts === -1)) {
    actions.push({ id: "delete", label: "删除订单", tone: "neutral" });
  }
  actions.push({ id: "contact", label: "联系商家", tone: "neutral" });

  return actions;
}

function normalizeOrderItems(items: JavaOrderItem[] | undefined, options: { javaOssAssetBaseUrl?: string }): OrderProductView[] {
  return (Array.isArray(items) ? items : []).map((item) => ({
    afterSaleTags: getAfterSaleTags(item.afterSaleType),
    imageUrl: resolveAssetUrl(item.pic, options.javaOssAssetBaseUrl),
    itemId: normalizeText(item.orderItemId, ""),
    price: normalizeMoney(item.price, 0),
    prodId: normalizeText(item.prodId, ""),
    properties: normalizeText(item.properties, ""),
    quantity: normalizeNumber(item.prodCount, 1),
    refundSn: normalizeText(item.refundSn, ""),
    skuId: normalizeText(item.skuId, ""),
    title: normalizeText(item.prodName, "商品")
  }));
}

function getAfterSaleTags(value: unknown): string[] {
  const nameMap: Record<string, string> = {
    "1": "7天无理由退货",
    "2": "售后私信协商",
    "3": "假一罚十",
    "4": "退货免运费",
    "5": "其他"
  };
  return normalizeText(value, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => nameMap[item])
    .filter(Boolean);
}

function getRefundStatusTexts(order: JavaOrder): string[] {
  const status = normalizeNumber(order.status, 0);
  const refundStatus = normalizeNumber(order.refundStatus, 0);
  const returnMoneySts = normalizeNullableNumber(order.returnMoneySts);
  const isPartialDelivery = status <= 2 && normalizeNumber(order.deliveryCount, 0) > 0 && normalizeNumber(order.productNums, 0) > normalizeNumber(order.deliveryCount, 0);

  if (refundStatus === 1) {
    return [isPartialDelivery ? "退款中，部分发货" : "退款中"];
  }
  if (returnMoneySts === 5 && refundStatus !== 3) {
    return ["退款完成"];
  }
  if (returnMoneySts === 5 && refundStatus === 3) {
    return [isPartialDelivery ? "部分退款完成，部分发货" : "部分退款完成"];
  }
  if (returnMoneySts === -1) {
    return [isPartialDelivery ? "退款关闭，部分发货" : "退款关闭"];
  }
  if (isPartialDelivery) {
    return ["部分发货"];
  }
  return [];
}

function getOrderStatusLabel(status: unknown) {
  const labelMap: Record<number, string> = {
    1: "待付款",
    2: "待发货",
    3: "待收货",
    4: "待评价",
    5: "已完成",
    6: "已取消",
    7: "拼团中"
  };
  return labelMap[normalizeNumber(status, 0)] ?? "订单";
}

function normalizeOrderCardStatus(status: unknown): OrderCardStatus {
  const statusMap: Record<number, OrderCardStatus> = {
    1: "pending-payment",
    2: "pending-shipment",
    3: "pending-receipt",
    4: "review",
    5: "completed",
    6: "cancelled",
    7: "grouping"
  };
  return statusMap[normalizeNumber(status, 0)] ?? "completed";
}

function getRefundListStatusLabel(status: unknown) {
  const statusMap: Record<number, string> = {
    1: "退款中",
    2: "退款成功",
    3: "部分退款成功",
    4: "退款失败"
  };
  return statusMap[normalizeNumber(status, 0)] ?? "退款处理中";
}

function getDeliveryStateLabel(state: unknown) {
  const stateMap: Record<number, string> = {
    0: "在途",
    1: "揽收",
    2: "疑难",
    3: "签收",
    4: "退签",
    5: "派件",
    6: "退回",
    7: "转投"
  };
  return stateMap[normalizeNumber(state, -1)] ?? "物流更新";
}

function unwrapJavaEnvelope<T>(envelope: JavaOrderEnvelope<T>, requestId: string | undefined, fallbackMessage: string): BackendApiResult<T> {
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
      route: "orders"
    }
  };
}

function isJavaSuccess(envelope: JavaOrderEnvelope<unknown>) {
  return envelope.success !== false && (envelope.code === undefined || envelope.code === "00000");
}

function normalizePage<T>(page: JavaPage<T> | null | undefined): Required<JavaPage<T>> {
  return {
    current: normalizePositiveInteger(page?.current, 1),
    pages: normalizePositiveInteger(page?.pages, 1),
    records: Array.isArray(page?.records) ? page.records : [],
    size: normalizePositiveInteger(page?.size, 10),
    total: normalizeNumber(page?.total, 0)
  };
}

function mapPage<T>(page: Required<JavaPage<T>>) {
  return {
    current: page.current,
    hasMore: page.current < page.pages,
    pages: page.pages,
    size: page.size,
    total: page.total
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

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalNumber(value: unknown) {
  const parsed = normalizeNullableNumber(value);
  return parsed === null ? undefined : parsed;
}

function normalizeMoney(value: unknown, fallback: number) {
  const parsed = normalizeNumber(value, fallback);
  return Math.round(parsed * 100) / 100;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = Math.floor(normalizeNumber(value, fallback));
  return parsed > 0 ? parsed : fallback;
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

function formatMoney(value: unknown) {
  return `￥${normalizeMoney(value, 0).toFixed(2)}`;
}

function formatDiscount(value: unknown) {
  const amount = Math.abs(normalizeMoney(value, 0));
  return amount > 0 ? `-￥${amount.toFixed(2)}` : "-￥0.00";
}

function maskPhone(value: string) {
  return value.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
}
