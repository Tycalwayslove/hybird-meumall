import { describe, expect, it } from "vitest";
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
});
