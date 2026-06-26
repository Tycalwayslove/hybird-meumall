import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PayWayPage from "@/app/pay-way/page";
import type { H5RequestOptions } from "@/lib/http";
import type { BackendRequestOptions } from "@/server/http/backend-client";
import { createPaymentApi } from "./api";
import { PayWayScreen, paymentStartedMessage } from "./components/PayWayScreen";
import {
  createCashierHrefFromSubmitResult,
  fetchOrderPayInfoData,
  type PaymentServerResponse
} from "./server/cashier-service";

const samplePayInfo = {
  endTime: "2026-06-26 16:30:00",
  status: 1,
  totalFee: 129.9,
  totalScore: 0
};

const samplePaySwitch = {
  aliPaySwitch: true,
  balancePaySwitch: false,
  payPalSwitch: false,
  wxPaySwitch: true
};

describe("cashier real flow service", () => {
  it("loads cashier amount, countdown source and app payment methods from legacy Java endpoints", async () => {
    const backendClient = createFakeBackendClient({
      "/p/order/getOrderPayInfoByOrderNumber?orderNumbers=O202606260001": {
        code: "00000",
        data: samplePayInfo,
        success: true
      },
      "/sys/config/info/getSysPaySwitch": {
        code: "00000",
        data: samplePaySwitch,
        success: true
      }
    });

    const result = await fetchOrderPayInfoData({
      authRequired: true,
      authToken: "mall-token",
      backendClient,
      orderNumbers: "O202606260001"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view).toMatchObject({
        amountText: "129.9",
        defaultPayType: 7,
        endTime: "2026-06-26 16:30:00",
        orderNumbers: "O202606260001",
        status: "pending",
        totalAmount: 129.9
      });
      expect(result.data.view.methods).toEqual([
        { id: "aliPay", label: "支付宝支付", payType: 7 },
        { id: "wechatPay", label: "微信支付", payType: 8 }
      ]);
    }
    expect(backendClient.requests.map((request) => ({ method: request.method, path: request.path }))).toEqual([
      { method: "GET", path: "/p/order/getOrderPayInfoByOrderNumber?orderNumbers=O202606260001" },
      { method: "GET", path: "/sys/config/info/getSysPaySwitch" }
    ]);
  });

  it("keeps confirm payment as a local prompt without calling Java pay this phase", () => {
    expect(paymentStartedMessage).toBe("已发起支付");
  });
});

describe("cashier browser api adapter", () => {
  it("keeps cashier requests inside H5 BFF endpoints", async () => {
    const calls: Array<{ body?: unknown; method?: string; path: string }> = [];
    const api = createPaymentApi({
      async request<T>(path: string, options: H5RequestOptions = {}) {
        calls.push({ body: options.body, method: options.method, path });
        return {
          data: {} as T,
          requestId: "req-payment-test",
          success: true
        };
      }
    });

    await api.getOrderPayInfo({ orderNumbers: "O202606260001" });

    expect(calls).toEqual([{ method: undefined, path: "/api/bff/order-pay-info?orderNumbers=O202606260001" }]);
  });
});

describe("cashier rendering", () => {
  it("renders a runtime cashier shell for submitted order numbers", async () => {
    const html = renderToStaticMarkup(
      await PayWayPage({
        searchParams: Promise.resolve({
          dvyType: "1",
          orderNumbers: "O202606260001"
        })
      })
    );

    expect(html).toContain("收银台");
    expect(html).toContain("正在读取订单支付信息");
  });

  it("renders cashier payment methods and amount in the migrated page style", () => {
    const html = renderToStaticMarkup(
      <PayWayScreen
        data={{
          defaultPayType: 7,
          dvyType: "1",
          endTime: "2026-06-26 16:30:00",
          isPurePoints: false,
          methods: [
            { id: "aliPay", label: "支付宝支付", payType: 7 },
            { id: "wechatPay", label: "微信支付", payType: 8 }
          ],
          orderNumbers: "O202606260001",
          status: "pending",
          statusText: "待支付",
          totalAmount: 129.9,
          amountText: "129.9",
          totalScore: 0
        }}
      />
    );

    expect(html).toContain("￥");
    expect(html).toContain("129");
    expect(html).toContain(".90");
    expect(html).toContain("支付宝支付");
    expect(html).toContain("微信支付");
    expect(html).toContain("确定支付");
  });

  it("links order submit success to pay-way with legacy query parameters", () => {
    expect(
      createCashierHrefFromSubmitResult({
        dvyType: "1",
        orderNumbers: "O202606260001",
        orderType: "0",
        ordermold: "0"
      })
    ).toBe("/pay-way?orderNumbers=O202606260001&dvyType=1&isPurePoints=0&orderType=0&ordermold=0");
  });

  it("keeps the cashier link under the configured H5 base path", () => {
    const previousBasePath = process.env.NEXT_PUBLIC_H5_BASE_PATH;
    process.env.NEXT_PUBLIC_H5_BASE_PATH = "/hybird";

    try {
      expect(
        createCashierHrefFromSubmitResult({
          dvyType: "1",
          orderNumbers: "O202606260001",
          orderType: "0",
          ordermold: "0"
        })
      ).toBe("/hybird/pay-way?orderNumbers=O202606260001&dvyType=1&isPurePoints=0&orderType=0&ordermold=0");
    } finally {
      process.env.NEXT_PUBLIC_H5_BASE_PATH = previousBasePath;
    }
  });

  it("keeps the payment button local with a started-payment prompt", () => {
    expect(paymentStartedMessage).toBe("已发起支付");
  });
});

type FakeBackendResponse =
  | { ok: false }
  | PaymentServerResponse<typeof samplePayInfo>
  | PaymentServerResponse<typeof samplePaySwitch>
  | PaymentServerResponse<Record<string, unknown>>;

function createFakeBackendClient(responses: Record<string, FakeBackendResponse>) {
  const requests: BackendRequestOptions[] = [];

  return {
    requests,
    async request<T>(options: BackendRequestOptions) {
      requests.push(options);
      const response = responses[options.path];

      if (!response || "ok" in response) {
        return {
          error: {
            code: "HTTP_ERROR" as const,
            httpStatus: 502,
            message: "payment request failed",
            recoverable: true,
            requestId: "req-payment-test"
          },
          ok: false as const
        };
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-payment-test",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
