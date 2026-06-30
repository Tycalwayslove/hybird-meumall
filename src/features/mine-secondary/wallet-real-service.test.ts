import { describe, expect, it } from "vitest";

import type { BackendRequestOptions } from "@/server/http/backend-client";
import {
  fetchBankCardsData,
  fetchWalletData,
  unbindBankCard,
  type WalletJavaEnvelope
} from "./server/wallet-real-service";

describe("wallet real service", () => {
  it("loads wallet summary and promotion orders using distribution user id from overview", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/api/queryPromotionOrder?current=1&size=10&state=2&userId=7788": {
        code: "00000",
        data: {
          current: 1,
          pages: 1,
          records: [
            {
              createTime: "2026-06-30 10:00:00",
              distributionAmount: 99.5,
              orderNumber: "NO1001",
              pic: "prod/order.png",
              prodName: "推广订单商品",
              state: 2
            }
          ],
          size: 10,
          total: 1
        },
        success: true
      },
      "/p/distribution/home/overview": {
        code: "00000",
        data: {
          userInfo: {
            cardNo: "DU7788",
            distributionUserId: 7788
          }
        },
        success: true
      },
      "/p/distribution/wallet/info": {
        code: "00000",
        data: {
          addupAmount: 1200.5,
          applyWithdrawAmount: 30,
          extractedAmount: 200,
          settledAmount: 800,
          unsettledAmount: 400
        },
        success: true
      }
    });

    const result = await fetchWalletData({
      authToken: "token",
      backendClient,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      route: "/api/bff/wallet",
      state: "settled"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.summary).toEqual(
        expect.objectContaining({
          balanceText: "1200.50",
          pendingIncomeText: "+400.00",
          settledIncomeText: "+800.00",
          unsettledText: "400.00",
          withdrawText: "200.00",
          withdrawableText: "800.00"
        })
      );
      expect(result.data.view.orders).toEqual([
        expect.objectContaining({
          amountText: "+99.50",
          detailHref: "/orders/NO1001",
          id: "NO1001",
          imageUrl: "https://oss.example.com/prod/order.png",
          status: "settled",
          title: "推广订单商品"
        })
      ]);
    }
    expect(backendClient.paths).toEqual([
      "GET /p/distribution/wallet/info",
      "GET /p/distribution/home/overview",
      "GET /p/distribution/api/queryPromotionOrder?current=1&size=10&state=2&userId=7788"
    ]);
  });

  it("returns parse error when promotion overview does not provide distribution user id", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/home/overview": {
        code: "00000",
        data: { userInfo: {} },
        success: true
      },
      "/p/distribution/wallet/info": {
        code: "00000",
        data: { addupAmount: 10 },
        success: true
      }
    });

    const result = await fetchWalletData({
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet",
      state: "settled"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("PARSE_ERROR");
      expect(result.error.message).toContain("分销员ID");
    }
    expect(backendClient.paths).toEqual(["GET /p/distribution/wallet/info", "GET /p/distribution/home/overview"]);
  });

  it("loads bank cards and carries sign number from promotion overview for unbind", async () => {
    const backendClient = createFakeBackendClient({
      "/p/allinpay/member/queryBankCardV2": {
        code: "00000",
        data: [
          {
            bankCardNo: "6222020202025211",
            bankName: "工商银行",
            bindStatus: "1",
            cardType: "0"
          },
          {
            bankCardNo: "6222020202029999",
            bankName: "已解绑银行",
            bindStatus: "2",
            cardType: "1"
          }
        ],
        success: true
      },
      "/p/distribution/home/overview": {
        code: "00000",
        data: { userInfo: { cardNo: "DU7788", distributionUserId: 7788 } },
        success: true
      }
    });

    const result = await fetchBankCardsData({
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/bank-cards"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.cards).toEqual([
        expect.objectContaining({
          acctNum: "6222020202025211",
          bankName: "工商银行",
          cardTypeText: "储蓄卡",
          id: "6222020202025211",
          maskedCardNo: "**** **** **** 5211",
          signNum: "DU7788"
        })
      ]);
    }
  });

  it("unbinds a bank card with sign number and account number", async () => {
    const backendClient = createFakeBackendClient({
      "/p/allinpay/member/unbindBankCardV2": {
        code: "00000",
        data: null,
        success: true
      }
    });

    const result = await unbindBankCard({
      acctNum: "6222020202025211",
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/bank-cards/unbind",
      signNum: "DU7788"
    });

    expect(result.ok).toBe(true);
    expect(backendClient.paths).toEqual(["POST /p/allinpay/member/unbindBankCardV2"]);
    expect(backendClient.bodies).toEqual([{ acctNum: "6222020202025211", signNum: "DU7788" }]);
  });
});

function createFakeBackendClient(responses: Record<string, WalletJavaEnvelope<unknown>>) {
  const paths: string[] = [];
  const bodies: unknown[] = [];

  return {
    bodies,
    paths,
    async request<T>(options: BackendRequestOptions) {
      paths.push(`${options.method ?? "GET"} ${options.path}`);
      if (options.body !== undefined) {
        bodies.push(options.body);
      }
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
          requestId: "req-wallet",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
