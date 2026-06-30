import { describe, expect, it } from "vitest";

import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import { createWalletApi } from "./api";

describe("wallet browser api", () => {
  it("requests wallet and bank card operations through H5 BFF paths only", async () => {
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

    await api.getWallet({ current: 2, size: 10, state: "pending" });
    await api.getBankCards();
    await api.unbindBankCard({ acctNum: "6222020202025211", signNum: "DU7788" });

    expect(requests).toEqual([
      {
        method: undefined,
        path: "/api/bff/wallet?current=2&size=10&state=pending"
      },
      {
        method: undefined,
        path: "/api/bff/wallet/bank-cards"
      },
      {
        body: { acctNum: "6222020202025211", signNum: "DU7788" },
        method: "POST",
        path: "/api/bff/wallet/bank-cards/unbind"
      }
    ]);
  });
});
