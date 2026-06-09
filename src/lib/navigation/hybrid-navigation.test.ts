import { describe, expect, test, vi } from "vitest";

import { createProtocolBridge } from "@/lib/bridge/protocol-bridge";

import { buildClientHref, buildH5Url, createHybridNavigator, inferFallbackTab } from "./hybrid-navigation";

describe("hybrid navigation", () => {
  test("builds versioned H5 URLs from the public base path", () => {
    vi.stubEnv("NEXT_PUBLIC_H5_BASE_PATH", "/h5-v/v1.0.10");

    expect(buildClientHref("/promotion/benefits?level=v3")).toBe("/h5-v/v1.0.10/promotion/benefits?level=v3");
    expect(buildH5Url("/promotion/benefits?level=v3", { origin: "https://hybird.aigcpop.com" })).toBe(
      "https://hybird.aigcpop.com/h5-v/v1.0.10/promotion/benefits?level=v3"
    );

    vi.unstubAllEnvs();
  });

  test("does not double-prefix an already versioned client href", () => {
    vi.stubEnv("NEXT_PUBLIC_H5_BASE_PATH", "/hybird");

    expect(buildClientHref("/hybird/search")).toBe("/hybird/search");

    vi.unstubAllEnvs();
  });

  test("sends new webview, tab, close and route changed bridge messages", () => {
    const messages: unknown[] = [];
    const bridge = createProtocolBridge({
      postMessage: (message) => {
        messages.push(message);
      }
    });
    const navigator = createHybridNavigator({
      bridge,
      location: {
        origin: "https://hybird.aigcpop.com",
        pathname: "/h5-v/v1.0.10/",
        search: "",
        href: "https://hybird.aigcpop.com/h5-v/v1.0.10/"
      }
    });

    navigator.openWebView({ href: "/search", source: "home", title: "搜索" });
    navigator.switchTab("promotion", { closeCurrentWebView: true });
    navigator.closeWebView();
    navigator.reportRouteChanged({ path: "/promotion/activities", fallbackTab: "promotion", canGoBack: true });

    expect(messages).toEqual([
      {
        module: "router",
        action: "navigate",
        payload: {
          route: "webview",
          params: {
            url: "https://hybird.aigcpop.com/search",
            path: "/search",
            title: "搜索",
            source: "home"
          },
          presentation: { style: "push", animated: true }
        }
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
        payload: { route: "close_webview" }
      },
      {
        module: "event",
        action: "route_changed",
        payload: { path: "/promotion/activities", fallbackTab: "promotion", canGoBack: true }
      }
    ]);
  });

  test("infers fallback tab from a H5 path", () => {
    expect(inferFallbackTab("/promotion/rank-center")).toBe("promotion");
    expect(inferFallbackTab("/orders")).toBe("mine");
    expect(inferFallbackTab("/search")).toBe("home");
  });
});
