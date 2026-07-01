import { describe, expect, it } from "vitest";

import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import { createWalletApi } from "./api";

describe("wallet browser api", () => {
  it("requests wallet summary, paged orders and bank card operations through H5 BFF paths only", async () => {
    const requests: Array<{ body?: unknown; method?: string; path: string }> = [];
    const api = createWalletApi({
      async request<T>(path: string, options: H5RequestOptions = {}) {
        requests.push({ body: options.body, method: options.method, path });
        return {
          data: {} as T,
          requestId: "req-wallet-api",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getWalletSummary();
    await api.getWalletHistoryStatus();
    await api.getWalletOrders({ current: 2, size: 10, state: "pending" });
    await api.getWithdrawRecords({ current: 3, size: 20 });
    await api.applyWithdraw({ amount: 99.5 });
    await api.getBankCards();
    await api.getMemberInfo();
    await api.addBankCard({ acctNum: "6222020202025211", cerNum: "440101199001011234", phone: "13800138000" });
    await api.unbindBankCard({ acctNum: "6222020202025211" });

    expect(requests).toEqual([
      {
        method: undefined,
        path: "/api/bff/wallet/summary"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/history-status"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/orders?current=2&size=10&state=pending"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/withdraw-records?current=3&size=20"
      },
      {
        body: { amount: 99.5 },
        method: "POST",
        path: "/api/bff/wallet/withdraw"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/bank-cards"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/member-info"
      },
      {
        body: { acctNum: "6222020202025211", cerNum: "440101199001011234", phone: "13800138000" },
        method: "POST",
        path: "/api/bff/wallet/bank-cards/apply"
      },
      {
        body: { acctNum: "6222020202025211" },
        method: "POST",
        path: "/api/bff/wallet/bank-cards/unbind"
      }
    ]);
  });
});
