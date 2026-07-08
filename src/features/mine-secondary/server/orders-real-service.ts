import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

export type OrderStatus = "all" | "pending-payment" | "pending-shipment" | "pending-receipt" | "completed";
export type OrderCardStatus = Exclude<OrderStatus, "all"> | "cancelled" | "grouping" | "review";

export type OrderAction = {
  id: "cancel" | "contact" | "delete" | "evaluate" | "invoice" | "logistics" | "pay" | "receipt" | "refund-all";
  label: string;
  tone: "neutral" | "primary";
};

export type OrderProductView = {
  afterSaleTags: string[];
  actualTotal: number;
  canRefund: boolean;
  comboItems: OrderProductView[];
  giveawayItems: OrderProductView[];
  imageUrl?: string;
  isGift: boolean;
  itemId?: string;
  orderItemId?: string;
  price: number;
  prodId: string;
  properties: string;
  quantity: number;
  refundSn?: string;
  refundStatusLabel?: string;
  skuId?: string;
  title: string;
  useScore: number;
};

export type OrderCardView = {
  actions: OrderAction[];
  delivery?: {
    latestTime: string;
    latestTrace: string;
  };
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
  useScore: number;
};

export type RefundCardView = {
  applyType: number;
  applyTime: string;
  detailHref: string;
  items: OrderProductView[];
  platformStatusLabel: string;
  processText: string;
  refundAmount: number;
  refundSn: string;
  returnMoneySts: number;
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
  actions: Array<{
    id: "apply-platform" | "cancel-platform" | "cancel-refund" | "modify-amount" | "modify-application" | "modify-logistics" | "submit-logistics" | "supplement-voucher";
    label: string;
    tone: "neutral" | "primary";
  }>;
  buyerDesc: string;
  buyerMobile: string;
  buyerReason: string;
  canApplyPlatform: boolean;
  goodsNum: number;
  maxRefundAmount: number;
  orderNumber: string;
  photoFiles: string[];
  refundDelivery?: {
    address: string;
    companyName: string;
    expressNo: string;
    imgs: string[];
    mobile: string;
    receiver: string;
    senderRemarks: string;
  };
  refundId: string;
  refundType: number;
  refundScore: number;
  sellerMsg: string;
  timeline: Array<{ label: string; time: string }>;
};

export type LogisticsView = {
  deliveryList: JavaDeliveryPackage[];
  order: OrderDetailView;
  selectedDelivery?: JavaDeliveryPackage;
  traces: Array<{ label: string; time: string }>;
};

export type RefundContextInput = {
  applyType: number;
  buyerMobile?: string;
  giveawayItemIds?: Array<number | string>;
  goodsNum: number;
  isReceiver: number;
  orderId?: number | string | null;
  orderItemId?: number | string | null;
  orderNumber: string;
  photoFiles?: string;
  refundAmount: number | string;
  refundId?: number | string | null;
  refundSn?: string | null;
  refundType: number;
  buyerDesc: string;
  buyerReason: number | string;
};

export type DeliveryCompanyView = {
  id: string;
  name: string;
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
      view: mapJavaRefundToDetail(envelope.data, { javaOssAssetBaseUrl })
    },
    meta: response.meta
  };
}

export async function fetchLogisticsData({
  authToken,
  backendClient,
  deliveryId,
  javaOssAssetBaseUrl,
  orderNumber,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  deliveryId?: string;
  javaOssAssetBaseUrl?: string;
  orderNumber: string;
  route: string;
}): Promise<BackendApiResult<{ modules: { deliveryList: JavaDeliveryPackage[]; orderDetail: JavaOrderDetail; selectedDelivery?: JavaDeliveryPackage }; view: LogisticsView }>> {
  const [orderResponse, deliveryResponse] = await Promise.all([
    backendClient.request<JavaOrderEnvelope<JavaOrderDetail>>({
      authRequired: true,
      authToken,
      backend: "java",
      path: `/p/myOrder/orderDetail?${new URLSearchParams({ orderNumber }).toString()}`,
      route
    }),
    backendClient.request<JavaOrderEnvelope<JavaDeliveryPackage[]>>({
      authRequired: true,
      authToken,
      backend: "java",
      path: `/p/myDelivery/orderInfo/${encodeURIComponent(orderNumber)}`,
      route
    })
  ]);

  if (!orderResponse.ok) return orderResponse;
  if (!deliveryResponse.ok) return deliveryResponse;

  const orderEnvelope = unwrapJavaEnvelope(orderResponse.data, orderResponse.meta.requestId, "订单详情获取失败。");
  if (!orderEnvelope.ok) return orderEnvelope;
  const deliveryEnvelope = unwrapJavaEnvelope(deliveryResponse.data, deliveryResponse.meta.requestId, "物流详情获取失败。");
  if (!deliveryEnvelope.ok) return deliveryEnvelope;

  const deliveryList = Array.isArray(deliveryEnvelope.data) ? deliveryEnvelope.data : [];
  let selectedDelivery = deliveryList[0];

  if (deliveryId) {
    const packageResponse = await backendClient.request<JavaOrderEnvelope<JavaDeliveryPackage>>({
      authRequired: true,
      authToken,
      backend: "java",
      path: `/p/myDelivery/deliveryOrder/${encodeURIComponent(deliveryId)}`,
      route
    });
    if (!packageResponse.ok) return packageResponse;
    const packageEnvelope = unwrapJavaEnvelope(packageResponse.data, packageResponse.meta.requestId, "包裹物流获取失败。");
    if (!packageEnvelope.ok) return packageEnvelope;
    selectedDelivery = packageEnvelope.data;
  }

  const orderView = mapJavaOrderToDetail(orderEnvelope.data, selectedDelivery, { javaOssAssetBaseUrl });

  return {
    ok: true,
    data: {
      modules: {
        deliveryList,
        orderDetail: orderEnvelope.data,
        selectedDelivery
      },
      view: {
        deliveryList,
        order: orderView,
        selectedDelivery,
        traces: mapLogisticsTraces(selectedDelivery, orderEnvelope.data)
      }
    },
    meta: orderResponse.meta
  };
}

export function applyRefund({
  authToken,
  backendClient,
  input,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  input: RefundContextInput;
  route: string;
}) {
  const isUpdate = Boolean(input.refundId);
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      refundId: input.refundId || null,
      orderId: input.orderId || null,
      orderNumber: input.orderNumber,
      applyType: input.applyType,
      isReceiver: Number(input.isReceiver),
      buyerReason: input.buyerReason,
      goodsNum: Number(input.goodsNum),
      refundAmount: input.refundAmount,
      buyerMobile: input.buyerMobile || "",
      buyerDesc: input.buyerDesc,
      photoFiles: input.photoFiles || "",
      refundType: input.refundType,
      orderItemId: input.refundType === 2 ? input.orderItemId || null : null,
      giveawayItemIds: input.giveawayItemIds || []
    },
    method: isUpdate ? "PUT" : "POST",
    path: isUpdate ? "/p/orderRefund/update_refund" : "/p/orderRefund/apply",
    route,
    successMessage: isUpdate ? "退款申请已修改。" : "退款申请已提交。"
  });
}

export function cancelRefundApplication({
  authToken,
  backendClient,
  refundSn,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  refundSn: string;
  route: string;
}) {
  return mutateOrder({
    authToken,
    backendClient,
    body: refundSn,
    method: "PUT",
    path: "/p/orderRefund/cancel",
    route,
    successMessage: "退款申请已撤销。"
  });
}

export function updateRefundAmount({
  authToken,
  backendClient,
  refundAmount,
  refundSn,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  refundAmount: number | string;
  refundSn: string;
  route: string;
}) {
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      refundAmount,
      refundSn
    },
    method: "PUT",
    path: "/p/orderRefund/updateRefundAmount",
    route,
    successMessage: "退款金额已修改。"
  });
}

export function cancelPlatformIntervention({
  authToken,
  backendClient,
  orderNumber,
  refundId,
  refundSn,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  orderNumber: string;
  refundId: string;
  refundSn: string;
  route: string;
}) {
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      refundId,
      refundSn,
      orderNumber
    },
    method: "PUT",
    path: "/p/orderRefund/cancel_platform_intervention",
    route,
    successMessage: "平台介入申请已撤销。"
  });
}

export function submitPlatformIntervention({
  authToken,
  backendClient,
  input,
  pageType,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  input: {
    imgUrls: string;
    orderNumber: string;
    refundId: string;
    refundSts?: number | string | null;
    voucherDesc: string;
  };
  pageType: 1 | 2;
  route: string;
}) {
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      refundId: input.refundId,
      orderNumber: input.orderNumber,
      sysType: 0,
      refundSts: input.refundSts ?? "",
      voucherDesc: input.voucherDesc,
      imgUrls: input.imgUrls
    },
    method: pageType === 1 ? "PUT" : "POST",
    path: pageType === 1 ? "/p/orderRefund/apply_platform_intervention" : "/p/orderRefundIntervention/saveInterventionVoucher",
    route,
    successMessage: pageType === 1 ? "平台介入申请已提交。" : "凭证已补充。"
  });
}

export async function fetchDeliveryCompanies({
  authToken,
  backendClient,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  route: string;
}): Promise<BackendApiResult<{ modules: { raw: JavaDeliveryCompany[] }; view: { companies: DeliveryCompanyView[] } }>> {
  const response = await backendClient.request<JavaOrderEnvelope<JavaDeliveryCompany[]>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: "/p/delivery/list",
    route
  });
  if (!response.ok) return response;
  const envelope = unwrapJavaEnvelope(response.data, response.meta.requestId, "物流公司列表获取失败。");
  if (!envelope.ok) return envelope;
  const raw = Array.isArray(envelope.data) ? envelope.data : [];

  return {
    ok: true,
    data: {
      modules: {
        raw
      },
      view: {
        companies: raw.map((item) => ({
          id: normalizeText(item.dvyId, ""),
          name: normalizeText(item.dvyName, "")
        })).filter((item) => item.id && item.name)
      }
    },
    meta: response.meta
  };
}

export function submitReturnLogistics({
  authToken,
  backendClient,
  input,
  isModify,
  route
}: {
  authToken: string | null;
  backendClient: OrdersBackendClient;
  input: {
    expressId: string | number;
    expressName: string;
    expressNo: string;
    imgs?: string;
    mobile?: string;
    refundSn: string;
    senderRemarks?: string;
  };
  isModify: boolean;
  route: string;
}) {
  return mutateOrder({
    authToken,
    backendClient,
    body: {
      expressId: input.expressId,
      expressName: input.expressName,
      expressNo: input.expressNo,
      imgs: input.imgs || "",
      mobile: input.mobile || "",
      refundSn: input.refundSn,
      senderRemarks: input.senderRemarks || ""
    },
    method: isModify ? "PUT" : "POST",
    path: isModify ? "/p/orderRefund/reSubmitExpress" : "/p/orderRefund/submitExpress",
    route,
    successMessage: "退货物流已提交。"
  });
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
  actualTotal?: number | string | null;
  activityType?: number | string | null;
  commSts?: number | null;
  comboList?: JavaOrderItem[];
  giveawayAmount?: number | string | null;
  giveawayList?: JavaOrderItem[];
  memberAmount?: number | string | null;
  orderItemId?: number | string | null;
  orderType?: number | string | null;
  pic?: string | null;
  platformCouponAmount?: number | string | null;
  platformShareReduce?: number | string | null;
  price?: number | string | null;
  preSaleTime?: string | null;
  prodCount?: number | string | null;
  prodId?: number | string | null;
  prodName?: string | null;
  properties?: string | null;
  refundSn?: string | null;
  returnMoneySts?: number | string | null;
  shopId?: number | string | null;
  skuId?: number | string | null;
  skuName?: string | null;
  spuName?: string | null;
  type?: number | string | null;
  useScore?: number | string | null;
};

export type JavaOrder = {
  actualTotal?: number | string | null;
  canRefundAmount?: number | string | null;
  createTime?: string | null;
  deliveryCount?: number | string | null;
  deliveryDto?: JavaDeliveryPackage["deliveryDto"];
  dvyType?: number | string | null;
  finallyTime?: string | null;
  freeTransfee?: number | string | null;
  orderId?: number | string | null;
  orderInvoiceId?: number | string | null;
  orderItemDtos?: JavaOrderItem[];
  orderMold?: number | string | null;
  orderNumber?: string | null;
  orderScore?: number | string | null;
  orderType?: number | string | null;
  payTime?: string | null;
  payType?: number | string | null;
  platformFreeFreightAmount?: number | string | null;
  productNums?: number | string | null;
  refundStatus?: number | string | null;
  remarks?: string | null;
  returnMoneySts?: number | string | null;
  shopId?: number | string | null;
  shopName?: string | null;
  status?: number | string | null;
  total?: number | string | null;
  transfee?: number | string | null;
  userScore?: number | string | null;
  writeOffNum?: number | string | null;
};

export type JavaOrderDetail = JavaOrder & {
  canAllRefund?: boolean;
  canRefund?: boolean;
  createTime?: string | null;
  freeTransfee?: number | string | null;
  memberAmount?: number | string | null;
  orderScore?: number | string | null;
  payTime?: string | null;
  platformCouponAmount?: number | string | null;
  reduceAmount?: number | string | null;
  scoreAmount?: number | string | null;
  shopChangeFreeAmount?: number | string | null;
  shopComboAmount?: number | string | null;
  shopMemberAmount?: number | string | null;
  shopCouponMoney?: number | string | null;
  discountMoney?: number | string | null;
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
  applyType?: number | string | null;
  applyTime?: string | null;
  orderItemDtos?: JavaOrderItem[];
  orderItems?: JavaOrderItem[];
  platformInterventionStatus?: number | string | null;
  refundAmount?: number | string | null;
  refundSn?: string | null;
  refundStatus?: number | string | null;
  returnMoneySts?: number | string | null;
  shopName?: string | null;
};

export type JavaRefundDetail = JavaRefundOrder & {
  applyInterventionImgUrls?: string | null;
  applyInterventionReason?: string | null;
  buyerDesc?: string | null;
  buyerMobile?: string | null;
  buyerReason?: string | null;
  canApplyRefund?: boolean;
  deliveryDto?: JavaDeliveryPackage["deliveryDto"];
  goodsNum?: number | string | null;
  handelTime?: string | null;
  isCancel?: boolean;
  maxRefundAmount?: number | string | null;
  orderAmount?: number | string | null;
  orderNumber?: string | null;
  photoFiles?: string | null;
  platformMessage?: string | null;
  refundDelivery?: {
    addr?: string | null;
    deyId?: number | string | null;
    deyName?: string | null;
    deyNu?: string | null;
    imgs?: string | null;
    mobile?: string | null;
    receiver?: string | null;
    senderRemarks?: string | null;
  } | null;
  refundId?: number | string | null;
  refundScore?: number | string | null;
  refundTime?: string | null;
  refundType?: number | string | null;
  rejectMessage?: string | null;
  sellerMsg?: string | null;
  updateTime?: string | null;
};

export type JavaDeliveryPackage = {
  createTime?: string | null;
  deliveryDto?: {
    companyName?: string | null;
    dvyFlowId?: string | null;
    logo?: string | null;
    state?: number | string | null;
    traces?: Array<{
      acceptStation?: string | null;
      acceptTime?: string | null;
    }>;
  } | null;
  deliveryType?: number | string | null;
  dvyFlowId?: string | null;
  orderDeliveryId?: number | string | null;
  orderItems?: JavaOrderItem[];
};

export type JavaDeliveryInfo = JavaDeliveryPackage;

export type JavaDeliveryCompany = {
  dvyId?: number | string | null;
  dvyName?: string | null;
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
  buyerMobile: string;
  canAllRefund: boolean;
  canRenderAsOrdinaryExpress: boolean;
  canRefund: boolean;
  canRefundAmount: number;
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
  dvyType: number;
  freeTransfee: number;
  orderId: string;
  orderMold: number;
  orderNumber: string;
  orderScore: number;
  orderType: number;
  payTime: string;
  platformFreeFreightAmount: number;
  refundStatusTexts: string[];
  shopName: string;
  status: OrderCardStatus;
  statusLabel: string;
  totalAmount: number;
  transfee: number;
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
    totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
    useScore: normalizeNumber(order.userScore ?? order.orderScore, 0)
  };
}

function mapJavaRefundToCard(refund: JavaRefundOrder, options: { javaOssAssetBaseUrl?: string } = {}): RefundCardView {
  const refundSn = normalizeText(refund.refundSn, "");
  const items = refund.orderItems ?? refund.orderItemDtos;
  const returnMoneySts = normalizeNumber(refund.returnMoneySts, 1);
  const platformStatus = normalizeNumber(refund.platformInterventionStatus, -1);

  return {
    applyType: normalizeNumber(refund.applyType, 1),
    applyTime: normalizeText(refund.applyTime, ""),
    detailHref: `/refunds/${encodeURIComponent(refundSn)}`,
    items: normalizeOrderItems(items, options),
    platformStatusLabel: getPlatformInterventionStatusLabel(platformStatus),
    processText: getRefundProcessText(refund),
    refundAmount: normalizeMoney(refund.refundAmount, 0),
    refundSn,
    returnMoneySts,
    shopName: normalizeText(refund.shopName, "官方店铺"),
    statusLabel: platformStatus !== -1 ? getPlatformInterventionStatusLabel(platformStatus) : getReturnMoneyStatusLabel(returnMoneySts)
  };
}

function mapJavaRefundToDetail(refund: JavaRefundDetail, options: { javaOssAssetBaseUrl?: string } = {}): RefundDetailView {
  const card = mapJavaRefundToCard(refund, options);
  const delivery = refund.refundDelivery;

  return {
    ...card,
    actions: getRefundDetailActions(refund),
    buyerDesc: normalizeText(refund.buyerDesc, ""),
    buyerMobile: normalizeText(refund.buyerMobile, ""),
    buyerReason: normalizeText(refund.buyerReason, ""),
    canApplyPlatform: refund.canApplyRefund === true,
    goodsNum: normalizeNumber(refund.goodsNum, card.items.reduce((sum, item) => sum + item.quantity, 0)),
    maxRefundAmount: normalizeMoney(refund.maxRefundAmount, card.refundAmount),
    orderNumber: normalizeText(refund.orderNumber, ""),
    photoFiles: splitUrlList(refund.photoFiles).map((item) => resolveAssetUrl(item, options.javaOssAssetBaseUrl) ?? item),
    refundDelivery: delivery
      ? {
          address: normalizeText(delivery.addr, ""),
          companyName: normalizeText(delivery.deyName, ""),
          expressNo: normalizeText(delivery.deyNu, ""),
          imgs: splitUrlList(delivery.imgs).map((item) => resolveAssetUrl(item, options.javaOssAssetBaseUrl) ?? item),
          mobile: maskPhone(normalizeText(delivery.mobile, "")),
          receiver: normalizeText(delivery.receiver, ""),
          senderRemarks: normalizeText(delivery.senderRemarks, "")
        }
      : undefined,
    refundId: normalizeText(refund.refundId, ""),
    refundType: normalizeNumber(refund.refundType, 2),
    refundScore: normalizeNumber(refund.refundScore, 0),
    sellerMsg: normalizeText(refund.sellerMsg, ""),
    timeline: [
      { label: "提交申请", time: normalizeText(refund.applyTime, "") },
      { label: "商家处理", time: normalizeText(refund.handelTime, "") },
      { label: "退款完成", time: normalizeText(refund.refundTime, "") }
    ].filter((item) => item.time)
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
    buyerMobile: normalizeText(address?.mobile, ""),
    canAllRefund: order.canAllRefund === true,
    canRenderAsOrdinaryExpress: normalizeNumber(order.orderMold, 0) !== 1 && normalizeNumber(order.dvyType, 1) !== 2,
    canRefund: order.canRefund === true,
    canRefundAmount: normalizeMoney(order.canRefundAmount, order.actualTotal ? Number(order.actualTotal) : 0),
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
    dvyType: normalizeNumber(order.dvyType, 1),
    freeTransfee: normalizeMoney(order.freeTransfee, 0),
    orderId: normalizeText(order.orderId, ""),
    orderMold: normalizeNumber(order.orderMold, 0),
    orderNumber: card.orderNumber,
    orderScore: normalizeNumber(order.orderScore, 0),
    orderType: normalizeNumber(order.orderType, 0),
    payTime: normalizeText(order.payTime, ""),
    platformFreeFreightAmount: normalizeMoney(order.platformFreeFreightAmount, 0),
    refundStatusTexts: card.refundStatusTexts,
    shopName: card.shopName,
    status: card.status,
    statusLabel: card.statusLabel,
    totalAmount: card.totalAmount,
    transfee: normalizeMoney(order.transfee, 0)
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
    actualTotal: normalizeMoney(item.actualTotal ?? item.price, 0),
    canRefund: !normalizeText(item.refundSn, "") && normalizeNumber(item.returnMoneySts, 0) !== 5,
    comboItems: normalizeOrderItems(item.comboList, options),
    giveawayItems: normalizeOrderItems(item.giveawayList, options),
    imageUrl: resolveAssetUrl(item.pic, options.javaOssAssetBaseUrl),
    isGift: normalizeNumber(item.activityType ?? item.type, 0) === 5,
    itemId: normalizeText(item.orderItemId, ""),
    orderItemId: normalizeText(item.orderItemId, ""),
    price: normalizeMoney(item.price, 0),
    prodId: normalizeText(item.prodId, ""),
    properties: normalizeText(item.properties, ""),
    quantity: normalizeNumber(item.prodCount, 1),
    refundSn: normalizeText(item.refundSn, ""),
    refundStatusLabel: item.refundSn ? getReturnMoneyStatusLabel(item.returnMoneySts) : "",
    skuId: normalizeText(item.skuId, ""),
    title: normalizeText(item.prodName, "商品"),
    useScore: normalizeNumber(item.useScore, 0)
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

function getRefundDetailActions(refund: JavaRefundDetail): RefundDetailView["actions"] {
  const actions: RefundDetailView["actions"] = [];
  const returnMoneySts = normalizeNumber(refund.returnMoneySts, 1);
  const applyType = normalizeNumber(refund.applyType, 1);
  const platformStatus = normalizeNumber(refund.platformInterventionStatus, -1);
  const refundType = normalizeNumber(refund.refundType, 2);
  const hasPlatform = platformStatus !== -1;

  if (refund.canApplyRefund && !hasPlatform) {
    actions.push({ id: "apply-platform", label: "申请平台介入", tone: "neutral" });
  }
  if (hasPlatform && platformStatus === 1) {
    actions.push({ id: "supplement-voucher", label: "补充凭证", tone: "neutral" });
    actions.push({ id: "cancel-platform", label: "撤销平台介入", tone: "neutral" });
  }
  if (refund.isCancel && (returnMoneySts === 1 || returnMoneySts === 2 || returnMoneySts === 7)) {
    actions.push({ id: "cancel-refund", label: "撤销申请", tone: "neutral" });
  }
  if (returnMoneySts === 2 && applyType === 2) {
    actions.push({ id: "submit-logistics", label: "填写退货物流", tone: "primary" });
  }
  if (returnMoneySts === 3 && applyType === 2) {
    actions.push({ id: "modify-logistics", label: "修改退货物流", tone: "neutral" });
  }
  if (refundType !== 1 && returnMoneySts === 1) {
    actions.push({ id: "modify-amount", label: "修改退款金额", tone: "neutral" });
  }
  if (returnMoneySts === 1 || returnMoneySts === 7) {
    actions.push({ id: "modify-application", label: "修改申请", tone: "primary" });
  }

  return actions;
}

function getRefundProcessText(refund: JavaRefundOrder) {
  const returnMoneySts = normalizeNumber(refund.returnMoneySts, 1);
  const applyType = normalizeNumber(refund.applyType, 1);
  const refundAmount = formatMoney(refund.refundAmount);
  if (normalizeNumber(refund.platformInterventionStatus, -1) !== -1) {
    return "平台客服处理中，请关注处理结果";
  }
  if (returnMoneySts === 1) return "商家将在规定时间内处理退款申请";
  if (returnMoneySts === 2 && applyType === 1) return "商家同意退款，等待退款到账";
  if (returnMoneySts === 2 && applyType === 2) return "商家已同意，请填写退货物流";
  if (returnMoneySts === 3) return "买家已发货，等待商家收货";
  if (returnMoneySts === 4) return "商家已收货，退款处理中";
  if (returnMoneySts === 5) return `退款成功，退款金额 ${refundAmount}`;
  if (returnMoneySts === 6) return "买家已撤销退款申请";
  if (returnMoneySts === 7) return "商家拒绝退款，可修改申请或申请平台介入";
  if (returnMoneySts === -1) return "退款已关闭";
  return "退款处理中";
}

function getReturnMoneyStatusLabel(status: unknown) {
  const statusMap: Record<number, string> = {
    [-1]: "退款关闭",
    1: "买家申请退款",
    2: "商家同意退款",
    3: "买家已发货",
    4: "商家已收货",
    5: "退款成功",
    6: "买家撤销申请",
    7: "商家拒绝退款"
  };
  return statusMap[normalizeNumber(status, 1)] ?? "退款处理中";
}

function getPlatformInterventionStatusLabel(status: unknown) {
  const statusMap: Record<number, string> = {
    [-1]: "",
    1: "平台介入中",
    2: "平台同意退款",
    3: "平台拒绝退款",
    4: "平台同意退款并退款成功"
  };
  return statusMap[normalizeNumber(status, -1)] ?? "";
}

function mapLogisticsTraces(deliveryInfo: JavaDeliveryPackage | undefined, order: JavaOrderDetail) {
  const traces = Array.isArray(deliveryInfo?.deliveryDto?.traces) ? deliveryInfo.deliveryDto.traces : [];
  const result = traces.map((item) => ({
    label: normalizeText(item.acceptStation, "物流更新"),
    time: normalizeText(item.acceptTime, "")
  }));
  if (deliveryInfo?.createTime) {
    result.push({ label: "商家已发货", time: normalizeText(deliveryInfo.createTime, "") });
  }
  if (order.payTime) {
    result.push({ label: "买家已付款", time: normalizeText(order.payTime, "") });
  }
  if (order.createTime) {
    result.push({ label: "买家提交订单", time: normalizeText(order.createTime, "") });
  }
  return result;
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

function splitUrlList(value: unknown) {
  return normalizeText(value, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
