import { describe, expect, it, vi } from "vitest";
import { createProtocolBridge } from "./protocol-bridge";

describe("protocol bridge", () => {
  it("posts router and event messages with the shared envelope", async () => {
    const messages: unknown[] = [];
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      },
      createCallbackId: () => "cb_test"
    });

    bridge.navigate({ route: "product_detail", params: { id: "p-1001" } });
    bridge.emit("token_expired", { reason: "401" });
    bridge.navigate({ route: "tab", params: { tab: "promotion", closeCurrentWebView: true } });
    bridge.navigate({ route: "close_webview" });
    bridge.emit("route_changed", { path: "/promotion/rank-center", fallbackTab: "promotion", canGoBack: false });

    expect(messages).toEqual([
      {
        module: "router",
        action: "navigate",
        payload: {
          route: "product_detail",
          params: { id: "p-1001" }
        }
      },
      {
        module: "event",
        action: "token_expired",
        payload: { reason: "401" }
      },
      {
        module: "router",
        action: "navigate",
        payload: {
          route: "tab",
          params: { tab: "promotion", closeCurrentWebView: true }
        }
      },
      {
        module: "router",
        action: "navigate",
        payload: {
          route: "close_webview"
        }
      },
      {
        module: "event",
        action: "route_changed",
        payload: { path: "/promotion/rank-center", fallbackTab: "promotion", canGoBack: false }
      }
    ]);
  });

  it("resolves rpc calls through window.__bridgeHandler callbacks", async () => {
    const messages: unknown[] = [];
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      },
      createCallbackId: () => "cb_tokens",
      timeoutMs: 100
    });

    const promise = bridge.rpc("getTokens");

    expect(messages).toEqual([
      {
        module: "rpc",
        action: "getTokens",
        callbackId: "cb_tokens"
      }
    ]);

    bridge.reply.resolve("cb_tokens", {
      accessToken: "access-token",
      mallToken: "mall-token",
      expiredAt: 1735689600000
    });

    await expect(promise).resolves.toEqual({
      accessToken: "access-token",
      mallToken: "mall-token",
      expiredAt: 1735689600000
    });
  });

  it("logs readable router navigate details before sending them to native bridge", () => {
    const messages: unknown[] = [];
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      }
    });
    const payload = {
      route: "webview" as const,
      params: {
        source: "home",
        title: "搜索",
        url: "https://hybird.aigcpop.com/h5-v/v1.0.8/search"
      },
      presentation: { style: "push" as const, animated: true }
    };

    try {
      bridge.navigate(payload);

      expect(infoSpy).toHaveBeenCalledWith("[MeuMall][bridge-router:navigate] Bridge 调用参数明细", {
        action: "router.navigate",
        message: {
          module: "router",
          action: "navigate",
          payload
        },
        params: payload.params,
        payload,
        payloadJson: JSON.stringify(payload, null, 2),
        presentation: payload.presentation,
        route: "webview",
        sentAt: expect.any(String)
      });
      expect(messages).toEqual([
        {
          module: "router",
          action: "navigate",
          payload
        }
      ]);
    } finally {
      infoSpy.mockRestore();
    }
  });

  it("posts address rpc messages through the shared envelope", async () => {
    const messages: unknown[] = [];
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      },
      createCallbackId: () => "cb_address",
      timeoutMs: 100
    });

    const promise = bridge.rpc("address.getList");

    expect(messages).toEqual([
      {
        module: "rpc",
        action: "address.getList",
        callbackId: "cb_address"
      }
    ]);

    bridge.reply.resolve("cb_address", {
      addresses: [
        {
          addr: "东风中路268号",
          addrId: "3001",
          area: "越秀区",
          city: "广州市",
          commonAddr: 1,
          mobile: "1827267737",
          province: "广东省",
          receiver: "秦先生"
        }
      ]
    });

    await expect(promise).resolves.toEqual({
      addresses: [
        {
          addr: "东风中路268号",
          addrId: "3001",
          area: "越秀区",
          city: "广州市",
          commonAddr: 1,
          mobile: "1827267737",
          province: "广东省",
          receiver: "秦先生"
        }
      ]
    });
  });

  it("posts reserved address location rpc messages through the shared envelope", async () => {
    const messages: unknown[] = [];
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      },
      createCallbackId: () => "cb_location",
      timeoutMs: 100
    });

    const promise = bridge.rpc("address.chooseLocation");

    expect(messages).toEqual([
      {
        module: "rpc",
        action: "address.chooseLocation",
        callbackId: "cb_location"
      }
    ]);

    bridge.reply.resolve("cb_location", {
      location: {
        addr: "东风中路268号",
        area: "越秀区",
        city: "广州市",
        lat: 23.1291,
        lng: 113.2644,
        name: "交易广场",
        province: "广东省"
      }
    });

    await expect(promise).resolves.toEqual({
      location: {
        addr: "东风中路268号",
        area: "越秀区",
        city: "广州市",
        lat: 23.1291,
        lng: 113.2644,
        name: "交易广场",
        province: "广东省"
      }
    });
  });
});
