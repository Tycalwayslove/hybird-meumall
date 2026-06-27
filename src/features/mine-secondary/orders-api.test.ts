import { describe, expect, it } from "vitest";

import type { H5BffResult } from "@/lib/http";
import type { H5RequestOptions } from "@/lib/http";

import { createOrdersApi } from "./api";

describe("orders browser api", () => {
  it("requests normal orders, refund orders and order actions through H5 BFF paths only", async () => {
    const requests: Array<{ body?: unknown; method?: string; path: string }> = [];
    const api = createOrdersApi({
      async request<T>(path: string, options: H5RequestOptions = {}) {
        requests.push({ body: options.body, method: options.method, path });
        return {
          data: {} as T,
          requestId: "req-orders-api",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getOrders({ current: 2, keyword: "牛奶", size: 20, status: "pending-payment" });
    await api.getRefundOrders({ current: 1, size: 10 });
    await api.getOrderDetail("NO20260627001");
    await api.cancelOrder("NO20260627001");
    await api.receiptOrder("NO20260627001");
    await api.deleteOrder("NO20260627001");
    await api.submitContactMessage({
      messageContent: "请尽快联系我",
      orderNumber: "NO20260627001",
      userMobile: "13800138000"
    });
    await api.getRefundDetail("RF20260627001");

    expect(requests).toEqual([
      {
        method: undefined,
        path: "/api/bff/orders?current=2&size=20&status=pending-payment&keyword=%E7%89%9B%E5%A5%B6"
      },
      {
        method: undefined,
        path: "/api/bff/orders/refunds?current=1&size=10"
      },
      {
        method: undefined,
        path: "/api/bff/orders/detail?orderNumber=NO20260627001"
      },
      {
        body: { orderNumber: "NO20260627001" },
        method: "PUT",
        path: "/api/bff/orders/cancel"
      },
      {
        body: { orderNumber: "NO20260627001" },
        method: "PUT",
        path: "/api/bff/orders/receipt"
      },
      {
        method: "DELETE",
        path: "/api/bff/orders/delete?orderNumber=NO20260627001"
      },
      {
        body: {
          messageContent: "请尽快联系我",
          orderNumber: "NO20260627001",
          userMobile: "13800138000"
        },
        method: "POST",
        path: "/api/bff/orders/contact-message"
      },
      {
        method: undefined,
        path: "/api/bff/orders/refund-detail?refundSn=RF20260627001"
      }
    ]);
  });
});
