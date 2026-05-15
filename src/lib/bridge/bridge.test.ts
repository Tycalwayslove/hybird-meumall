import { describe, expect, it, vi } from "vitest";
import {
  createNativeBridge,
  createNativeWindowBridgeAdapter,
  createWebBridgeAdapter,
  nativeBridge,
  type BridgeErrorCode
} from "./index";

describe("native bridge", () => {
  it("uses the web mock adapter for predictable app.getVersion results", async () => {
    const bridge = createNativeBridge({
      adapter: createWebBridgeAdapter({
        appVersion: "1.2.3",
        platform: "ios",
        channel: "dev"
      })
    });

    const result = await bridge.call("app.getVersion");

    expect(result).toEqual({
      ok: true,
      data: {
        appVersion: "1.2.3",
        platform: "ios",
        channel: "dev"
      }
    });
  });

  it("returns a mock auth token without persisting sensitive state", async () => {
    const bridge = createNativeBridge({
      adapter: createWebBridgeAdapter({ token: "mock-token" })
    });

    const result = await bridge.call("user.getToken");

    expect(result).toEqual({
      ok: true,
      data: {
        token: "mock-token",
        expiresAt: null
      }
    });
  });

  it("passes payloads for webview.setTitle", async () => {
    const adapter = createWebBridgeAdapter();
    const bridge = createNativeBridge({ adapter });

    const result = await bridge.call("webview.setTitle", { title: "会员中心" });

    expect(result).toEqual({ ok: true, data: { applied: true } });
  });

  it("reports METHOD_NOT_FOUND when the adapter does not support a method", async () => {
    const bridge = createNativeBridge({
      adapter: {
        canCall: () => false,
        call: async () => {
          throw new Error("unexpected call");
        }
      }
    });

    const result = await bridge.call("webview.close");

    expect(errorCode(result)).toBe("METHOD_NOT_FOUND");
  });

  it("reports BRIDGE_UNAVAILABLE when no adapter is available", async () => {
    const bridge = createNativeBridge();

    const result = await bridge.call("app.getVersion");

    expect(errorCode(result)).toBe("BRIDGE_UNAVAILABLE");
  });

  it("reports TIMEOUT when the adapter does not resolve before timeout", async () => {
    const bridge = createNativeBridge({
      adapter: {
        canCall: () => true,
        call: () => new Promise(() => undefined)
      },
      timeoutMs: 1
    });

    const result = await bridge.call("app.getVersion");

    expect(errorCode(result)).toBe("TIMEOUT");
  });

  it("normalizes thrown native errors", async () => {
    const bridge = createNativeBridge({
      adapter: {
        canCall: () => true,
        call: async () => {
          throw new Error("native failed");
        }
      }
    });

    const result = await bridge.call("app.getVersion");

    expect(errorCode(result)).toBe("NATIVE_ERROR");
  });

  it("adapts window.MeumallNativeBridge.call", async () => {
    const call = vi.fn(async () => ({ appVersion: "2.0.0", platform: "android", channel: "qa" }));
    const adapter = createNativeWindowBridgeAdapter({
      MeumallNativeBridge: {
        call,
        canCall: (method) => method === "app.getVersion"
      }
    });
    const bridge = createNativeBridge({ adapter });

    const result = await bridge.call("app.getVersion");

    expect(call).toHaveBeenCalledWith("app.getVersion", undefined);
    expect(result).toEqual({
      ok: true,
      data: {
        appVersion: "2.0.0",
        platform: "android",
        channel: "qa"
      }
    });
  });

  it("exports a default nativeBridge boundary", () => {
    expect(nativeBridge).toHaveProperty("call");
    expect(nativeBridge).toHaveProperty("canCall");
  });
});

function errorCode(result: Awaited<ReturnType<ReturnType<typeof createNativeBridge>["call"]>>): BridgeErrorCode | undefined {
  return result.ok ? undefined : result.error.code;
}
