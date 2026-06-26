import { describe, expect, test } from "vitest";

import {
  erudaEntryButtonPlacement,
  readDebugConsoleLogs,
  recordDebugConsoleLog,
  replayDebugConsoleLogs,
  shouldEnableDebugConsole
} from "./debug-console";

describe("debug console runtime", () => {
  test("enables debug console by default in local and test environments", () => {
    expect(shouldEnableDebugConsole("local")).toBe(true);
    expect(shouldEnableDebugConsole("test")).toBe(true);
  });

  test("hides debug console in production", () => {
    expect(shouldEnableDebugConsole("prod")).toBe(false);
    expect(shouldEnableDebugConsole("production")).toBe(false);
  });

  test("hides debug console for unknown environments", () => {
    expect(shouldEnableDebugConsole(undefined)).toBe(false);
    expect(shouldEnableDebugConsole("")).toBe(false);
    expect(shouldEnableDebugConsole("staging")).toBe(false);
  });

  test("places eruda entry in the middle right side of the screen", () => {
    expect(erudaEntryButtonPlacement()).toEqual({
      bottom: "auto",
      left: "auto",
      right: "max(12px, env(safe-area-inset-right))",
      top: "50%",
      transform: "translateY(-50%)"
    });
  });

  test("keeps recent debug logs across page reloads in local and test environments", () => {
    const storage = createMemoryStorage();

    recordDebugConsoleLog("[MeuMall][nav-intent]", { href: "/search", strategy: "new-h5-webview" }, { appEnv: "local", storage });

    expect(readDebugConsoleLogs({ appEnv: "local", storage })).toEqual([
      {
        createdAt: expect.any(String),
        label: "[MeuMall][nav-intent]",
        payload: { href: "/search", strategy: "new-h5-webview" }
      }
    ]);
    expect(readDebugConsoleLogs({ appEnv: "prod", storage })).toEqual([]);
  });

  test("replays persisted debug logs after eruda is initialized", () => {
    const storage = createMemoryStorage();
    const infoCalls: unknown[][] = [];

    recordDebugConsoleLog("[MeuMall][bridge-router:navigate] Bridge 调用参数明细", { route: "webview" }, { appEnv: "test", storage });
    replayDebugConsoleLogs({
      appEnv: "test",
      storage,
      log: (...args) => {
        infoCalls.push(args);
      }
    });

    expect(infoCalls).toEqual([
      [
        "[MeuMall][debug-console:previous]",
        {
          createdAt: expect.any(String),
          index: 1,
          label: "[MeuMall][bridge-router:navigate] Bridge 调用参数明细",
          payload: { route: "webview" },
          total: 1
        }
      ]
    ]);
  });
});

function createMemoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    }
  };
}
