import { describe, expect, it } from "vitest";

import type { BackendRequestOptions } from "@/server/http/backend-client";
import {
  addBankCard,
  applyWalletWithdraw,
  fetchBankCardsData,
  fetchWalletMemberInfoData,
  fetchWalletHistoryStatusData,
  fetchWalletWithdrawRecordsData,
  fetchWalletOrdersData,
  fetchWalletSummaryData,
  unbindBankCard
} from "./server/wallet-real-service";

describe("wallet real service", () => {
  it("loads wallet summary without requesting promotion orders", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/wallet/infoV2?userMobile=37": {
        code: "00000",
        data: {
          addupAmount: 1200.5,
          applyWithdrawAmount: 30,
          canWithdrawAmount: 800,
          extractedAmount: 200,
          settledAmount: 800,
          unsettledAmount: 400
        },
        success: true
      }
    });

    const result = await fetchWalletSummaryData({
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/summary",
      walletUserMobile: "37"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.summary).toEqual(
        expect.objectContaining({
          balanceText: "800.00",
          pendingIncomeText: "+400.00",
          settledIncomeText: "+800.00",
          unsettledText: "400.00",
          withdrawText: "200.00",
          withdrawableText: "800.00"
        })
      );
    }
    expect(backendClient.paths).toEqual(["GET /p/distribution/wallet/infoV2?userMobile=37"]);
  });

  it("loads wallet history status from python wallet state API", async () => {
    const backendClient = createFakeBackendClient({
      "/user/wallet_state": {
        state: 1
      }
    });

    const result = await fetchWalletHistoryStatusData({
      authToken: "python-token",
      backendClient,
      route: "/api/bff/wallet/history-status"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        modules: {
          walletState: {
            state: 1
          }
        },
        view: {
          hasHistoryWallet: true,
          state: 1
        }
      });
    }
    expect(backendClient.paths).toEqual(["GET /user/wallet_state"]);
  });

  it("hides wallet history entry when python wallet state is not historical", async () => {
    const backendClient = createFakeBackendClient({
      "/user/wallet_state": {
        data: {
          state: 0
        }
      }
    });

    const result = await fetchWalletHistoryStatusData({
      authToken: "python-token",
      backendClient,
      route: "/api/bff/wallet/history-status"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.hasHistoryWallet).toBe(false);
      expect(result.data.view.state).toBe(0);
    }
    expect(backendClient.paths).toEqual(["GET /user/wallet_state"]);
  });

  it("returns parse error when wallet summary does not have user mobile", async () => {
    const backendClient = createFakeBackendClient({});

    const result = await fetchWalletSummaryData({
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/summary",
      walletUserMobile: null
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("PARSE_ERROR");
      expect(result.error.message).toContain("用户手机号");
    }
    expect(backendClient.paths).toEqual([]);
  });

  it("loads paged promotion orders using phone from native user info cookie", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/api/queryPromotionOrder?current=2&size=10&state=1&userId=37": {
        code: "00000",
        data: {
          current: 2,
          pages: 3,
          records: [
            {
              createTime: "2026-06-30 10:00:00",
              distributionAmount: 99.5,
              orderNumber: "NO1001",
              pic: "prod/order.png",
              prodName: "推广订单商品",
              state: 1
            }
          ],
          size: 10,
          total: 21
        },
        success: true
      }
    });

    const result = await fetchWalletOrdersData({
      authToken: "token",
      backendClient,
      current: 2,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      promotionOrderUserId: "37",
      route: "/api/bff/wallet/orders",
      state: "pending"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toEqual({ current: 2, hasMore: true, pages: 3, size: 10, total: 21 });
      expect(result.data.view.orders).toEqual([
        expect.objectContaining({
          amountText: "+99.50",
          detailHref: "/orders/NO1001",
          id: "NO1001",
          imageUrl: "https://oss.example.com/prod/order.png",
          status: "pending",
          title: "推广订单商品"
        })
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/distribution/api/queryPromotionOrder?current=2&size=10&state=1&userId=37"]);
  });

  it("returns parse error when native user info cookie does not provide phone", async () => {
    const backendClient = createFakeBackendClient({});

    const result = await fetchWalletOrdersData({
      authToken: "token",
      backendClient,
      promotionOrderUserId: null,
      route: "/api/bff/wallet/orders",
      state: "settled"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("PARSE_ERROR");
      expect(result.error.message).toContain("用户手机号");
    }
    expect(backendClient.paths).toEqual([]);
  });

  it("loads paged withdraw records grouped by month", async () => {
    const backendClient = createFakeBackendClient({
      "/p/userWithdraw/pageDateUserWithdrawCash?current=2&size=10": {
        code: "00000",
        data: {
          current: 2,
          pages: 3,
          records: [
            {
              date: "2026-07",
              withdrawCashVOs: [
                {
                  amount: 98.5,
                  cashId: 1001,
                  createTime: "2026-07-01 10:00:00",
                  orderNo: "WD1001",
                  status: 1
                },
                {
                  amount: 20,
                  cashId: 1002,
                  createTime: "2026-07-02 10:00:00",
                  orderNo: "WD1002",
                  status: 2
                }
              ]
            }
          ],
          size: 10,
          total: 21
        },
        success: true
      }
    });

    const result = await fetchWalletWithdrawRecordsData({
      authToken: "token",
      backendClient,
      current: 2,
      route: "/api/bff/wallet/withdraw-records"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toEqual({ current: 2, hasMore: true, pages: 3, size: 10, total: 21 });
      expect(result.data.view.groups).toEqual([
        {
          date: "2026-07",
          records: [
            expect.objectContaining({
              amountText: "-¥98.50",
              id: "1001",
              orderNo: "WD1001",
              status: "processing",
              statusText: "到帐中",
              time: "2026-07-01 10:00:00",
              title: "提现"
            }),
            expect.objectContaining({
              amountText: "-¥20",
              id: "1002",
              status: "success",
              statusText: "成功"
            })
          ]
        }
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/userWithdraw/pageDateUserWithdrawCash?current=2&size=10"]);
  });

  it("loads bank cards without requesting promotion overview for sign number", async () => {
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
          maskedCardNo: "**** **** **** 5211"
        })
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/allinpay/member/queryBankCardV2"]);
  });

  it("loads wallet member certification info", async () => {
    const backendClient = createFakeBackendClient({
      "/p/allinpay/member/getMemberBasicInfoV2": {
        code: "00000",
        data: {
          cerNum: "440101199001011234",
          memberName: "张三",
          phone: "13800138000"
        },
        success: true
      }
    });

    const result = await fetchWalletMemberInfoData({
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/member-info"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.member).toEqual({
        cerNumText: "440***********1234",
        nameText: "张三"
      });
    }
    expect(backendClient.paths).toEqual(["GET /p/allinpay/member/getMemberBasicInfoV2"]);
  });

  it("adds a bank card with account, certificate and phone only", async () => {
    const backendClient = createFakeBackendClient({
      "/p/allinpay/member/createMemberApply": {
        code: "00000",
        data: {
          respCode: "00000",
          respMsg: "成功",
          respTraceNum: "trace-1001",
          signNum: "backend-owned"
        },
        success: true
      }
    });

    const result = await addBankCard({
      acctNum: "6222020202025211",
      authToken: "token",
      backendClient,
      cerNum: "440101199001011234",
      phone: "13800138000",
      route: "/api/bff/wallet/bank-cards/apply"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.message).toBe("添加成功");
    }
    expect(backendClient.paths).toEqual(["POST /p/allinpay/member/createMemberApply"]);
    expect(backendClient.bodies).toEqual([
      {
        acctNum: "6222020202025211",
        cerNum: "440101199001011234",
        phone: "13800138000"
      }
    ]);
  });

  it("applies wallet withdraw with amount only after checking withdrawable amount", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/wallet/infoV2?userMobile=37": {
        code: "00000",
        data: {
          canWithdrawAmount: 800,
          settledAmount: 800
        },
        success: true
      },
      "/p/allinpay/member/memberWithdrawApply": {
        code: "00000",
        data: {
          respCode: "00000",
          respMsg: "成功",
          respTraceNum: "trace-1001"
        },
        success: true
      }
    });

    const result = await applyWalletWithdraw({
      amount: "99.50",
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/withdraw",
      walletUserMobile: "37"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.message).toBe("提现申请已提交");
    }
    expect(backendClient.paths).toEqual(["GET /p/distribution/wallet/infoV2?userMobile=37", "POST /p/allinpay/member/memberWithdrawApply"]);
    expect(backendClient.bodies).toEqual([{ amount: 99.5 }]);
  });

  it("rejects wallet withdraw when amount exceeds withdrawable amount", async () => {
    const backendClient = createFakeBackendClient({
      "/p/distribution/wallet/infoV2?userMobile=37": {
        code: "00000",
        data: {
          canWithdrawAmount: 800,
          settledAmount: 800
        },
        success: true
      }
    });

    const result = await applyWalletWithdraw({
      amount: "900",
      authToken: "token",
      backendClient,
      route: "/api/bff/wallet/withdraw",
      walletUserMobile: "37"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("PARSE_ERROR");
      expect(result.error.message).toContain("可提现金额");
    }
    expect(backendClient.paths).toEqual(["GET /p/distribution/wallet/infoV2?userMobile=37"]);
    expect(backendClient.bodies).toEqual([]);
  });

  it("unbinds a bank card with account number only", async () => {
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
      route: "/api/bff/wallet/bank-cards/unbind"
    });

    expect(result.ok).toBe(true);
    expect(backendClient.paths).toEqual(["POST /p/allinpay/member/unbindBankCardV2"]);
    expect(backendClient.bodies).toEqual([{ acctNum: "6222020202025211" }]);
  });
});

function createFakeBackendClient(responses: Record<string, unknown>) {
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
