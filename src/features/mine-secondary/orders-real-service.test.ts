import { describe, expect, it } from "vitest";

import type { BackendRequestOptions } from "@/server/http/backend-client";
import {
  cancelOrder,
  deleteOrder,
  fetchOrderDetailData,
  fetchOrderListData,
  fetchRefundDetailData,
  fetchRefundOrderListData,
  mapOrderStatusToJavaStatus,
  receiptOrder,
  submitContactMessage,
  type JavaOrderEnvelope
} from "./server/orders-real-service";

describe("orders real service", () => {
  it("maps H5 order tabs to the legacy Java order status values", () => {
    expect(mapOrderStatusToJavaStatus("all")).toBe(0);
    expect(mapOrderStatusToJavaStatus("pending-payment")).toBe(1);
    expect(mapOrderStatusToJavaStatus("pending-shipment")).toBe(2);
    expect(mapOrderStatusToJavaStatus("pending-receipt")).toBe(3);
    expect(mapOrderStatusToJavaStatus("completed")).toBe(5);
  });

  it("loads normal orders with status, keyword and pagination, then maps cards and actions", async () => {
    const backendClient = createFakeBackendClient({
      "/p/myOrder/myOrder?current=2&size=20&status=1&prodName=%E7%89%9B%E5%A5%B6": {
        code: "00000",
        data: {
          current: 2,
          pages: 3,
          records: [samplePendingPaymentOrder],
          size: 20,
          total: 41
        },
        success: true
      }
    });

    const result = await fetchOrderListData({
      authToken: "token",
      backendClient,
      current: 2,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      keyword: "牛奶",
      route: "/api/bff/orders",
      size: 20,
      status: "pending-payment"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toEqual({ current: 2, hasMore: true, pages: 3, size: 20, total: 41 });
      expect(result.data.view.orders).toEqual([
        expect.objectContaining({
          actions: [
            { id: "cancel", label: "取消订单", tone: "neutral" },
            { id: "pay", label: "继续付款", tone: "primary" },
            { id: "contact", label: "联系商家", tone: "neutral" }
          ],
          detailHref: "/orders/NO20260627001",
          items: [
            expect.objectContaining({
              afterSaleTags: ["7天无理由退货", "假一罚十"],
              imageUrl: "https://oss.example.com/order/prod.png",
              properties: "颜色:白;容量:1L",
              quantity: 2,
              title: "有机鲜牛乳"
            })
          ],
          orderNumber: "NO20260627001",
          refundStatusTexts: [],
          shopName: "喵呜旗舰店",
          status: "pending-payment",
          statusLabel: "待付款",
          totalAmount: 39.8,
          totalCount: 2
        })
      ]);
      expect(result.data.modules.orderPage.records).toEqual([samplePendingPaymentOrder]);
    }
    expect(backendClient.paths).toEqual(["GET /p/myOrder/myOrder?current=2&size=20&status=1&prodName=%E7%89%9B%E5%A5%B6"]);
  });

  it("loads refund orders from the after-sales endpoint instead of the normal order status enum", async () => {
    const backendClient = createFakeBackendClient({
      "/p/orderRefund/list?current=1&size=10&startTime=&endTime=": {
        code: "00000",
        data: {
          current: 1,
          pages: 1,
          records: [sampleRefundOrder],
          size: 10,
          total: 1
        },
        success: true
      }
    });

    const result = await fetchRefundOrderListData({
      authToken: "token",
      backendClient,
      current: 1,
      route: "/api/bff/orders/refunds",
      size: 10
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.refunds).toEqual([
        expect.objectContaining({
          detailHref: "/refunds/RF20260627001",
          refundAmount: 19.9,
          refundSn: "RF20260627001",
          statusLabel: "退款成功"
        })
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/orderRefund/list?current=1&size=10&startTime=&endTime="]);
  });

  it("loads order detail and delivery summary for ordinary express orders", async () => {
    const backendClient = createFakeBackendClient({
      "/p/myOrder/orderDetail?orderNumber=NO20260627001": {
        code: "00000",
        data: sampleOrderDetail,
        success: true
      },
      "/p/myDelivery/orderInfo/NO20260627001": {
        code: "00000",
        data: [
          {
            deliveryDto: {
              state: 3,
              traces: [
                { acceptStation: "派送中", acceptTime: "2026-06-27 09:00:00" },
                { acceptStation: "已签收", acceptTime: "2026-06-27 12:00:00" }
              ]
            }
          }
        ],
        success: true
      }
    });

    const result = await fetchOrderDetailData({
      authToken: "token",
      backendClient,
      orderNumber: "NO20260627001",
      route: "/api/bff/orders/detail"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view).toEqual(
        expect.objectContaining({
          address: "广东省广州市越秀区东风中路268号",
          canRenderAsOrdinaryExpress: true,
          contactPhone: "138****8000",
          delivery: expect.objectContaining({
            latestTrace: "已签收",
            stateLabel: "签收"
          }),
          orderNumber: "NO20260627001",
          statusLabel: "待收货",
          totalAmount: 39.8
        })
      );
      expect(result.data.view.actions).toEqual([
        { id: "receipt", label: "确认收货", tone: "primary" },
        { id: "logistics", label: "查看物流", tone: "neutral" },
        { id: "contact", label: "联系商家", tone: "neutral" }
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/myOrder/orderDetail?orderNumber=NO20260627001", "GET /p/myDelivery/orderInfo/NO20260627001"]);
  });

  it("mutates legacy order actions and loads refund detail with the old parameters", async () => {
    const backendClient = createFakeBackendClient({
      "/p/myOrder/cancel/NO20260627001": { code: "00000", data: "取消成功", success: true },
      "/p/myOrder/receipt/NO20260627001": { code: "00000", data: "确认成功", success: true },
      "/p/myOrder/NO20260627001": { code: "00000", data: "删除成功", success: true },
      "/p/myOrder/submitMessage": { code: "00000", data: "提交成功", success: true },
      "/p/orderRefund/info?refundSn=RF20260627001": {
        code: "00000",
        data: { ...sampleRefundOrder, orderNumber: "NO20260627001" },
        success: true
      }
    });

    await cancelOrder({ authToken: "token", backendClient, orderNumber: "NO20260627001", route: "/api/bff/orders/cancel" });
    await receiptOrder({ authToken: "token", backendClient, orderNumber: "NO20260627001", route: "/api/bff/orders/receipt" });
    await deleteOrder({ authToken: "token", backendClient, orderNumber: "NO20260627001", route: "/api/bff/orders/delete" });
    await submitContactMessage({
      authToken: "token",
      backendClient,
      messageContent: "请尽快联系我",
      orderNumber: "NO20260627001",
      route: "/api/bff/orders/contact-message",
      userMobile: "13800138000"
    });
    const refundDetail = await fetchRefundDetailData({
      authToken: "token",
      backendClient,
      refundSn: "RF20260627001",
      route: "/api/bff/orders/refund-detail"
    });

    expect(refundDetail.ok).toBe(true);
    if (refundDetail.ok) {
      expect(refundDetail.data.view.refundSn).toBe("RF20260627001");
      expect(refundDetail.data.view.statusLabel).toBe("退款成功");
    }
    expect(backendClient.paths).toEqual([
      "PUT /p/myOrder/cancel/NO20260627001",
      "PUT /p/myOrder/receipt/NO20260627001",
      "DELETE /p/myOrder/NO20260627001",
      "POST /p/myOrder/submitMessage",
      "GET /p/orderRefund/info?refundSn=RF20260627001"
    ]);
    expect(backendClient.bodies).toEqual([
      undefined,
      undefined,
      undefined,
      {
        messageContent: "请尽快联系我",
        orderNumber: "NO20260627001",
        userMobile: "13800138000"
      },
      undefined
    ]);
  });
});

const samplePendingPaymentOrder = {
  actualTotal: 39.8,
  dvyType: 1,
  orderItemDtos: [
    {
      afterSaleType: "1,3",
      commSts: 0,
      pic: "order/prod.png",
      price: 19.9,
      prodCount: 2,
      prodId: 1000054,
      prodName: "有机鲜牛乳",
      properties: "颜色:白;容量:1L",
      returnMoneySts: 0,
      skuId: 8899
    }
  ],
  orderMold: 0,
  orderNumber: "NO20260627001",
  orderType: 0,
  refundStatus: 0,
  returnMoneySts: 0,
  shopId: 1001,
  shopName: "喵呜旗舰店",
  status: 1
};

const sampleRefundOrder = {
  applyTime: "2026-06-27 10:00:00",
  orderItems: [{ pic: "order/prod.png", prodName: "有机鲜牛乳", properties: "颜色:白", prodCount: 1 }],
  refundAmount: 19.9,
  refundSn: "RF20260627001",
  refundStatus: 2,
  shopName: "喵呜旗舰店"
};

const sampleOrderDetail = {
  ...samplePendingPaymentOrder,
  createTime: "2026-06-27 08:00:00",
  freeTransfee: 0,
  orderScore: 0,
  payTime: "2026-06-27 08:05:00",
  status: 3,
  transfee: 0,
  userAddrDto: {
    addr: "东风中路268号",
    area: "越秀区",
    city: "广州市",
    mobile: "13800138000",
    province: "广东省",
    receiver: "秦先生"
  }
};

function createFakeBackendClient(responses: Record<string, JavaOrderEnvelope<unknown>>) {
  const paths: string[] = [];
  const bodies: unknown[] = [];

  return {
    bodies,
    paths,
    async request<T>(options: BackendRequestOptions) {
      paths.push(`${options.method ?? "GET"} ${options.path}`);
      bodies.push(options.body);
      const response = responses[options.path];
      if (!response) {
        throw new Error(`Unexpected request: ${options.path}`);
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-orders",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
