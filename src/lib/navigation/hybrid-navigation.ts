import type { NavigatePayload, ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createWindowProtocolBridge } from "@/lib/bridge/protocol-bridge";

export type HybridTabKey = "home" | "promotion" | "mine";
export type NativePageName = string;

export type HybridNavigatorOptions = {
  bridge?: ProtocolBridge;
  location?: Pick<Location, "origin" | "pathname" | "search" | "href">;
  history?: Pick<History, "length" | "back">;
  assignLocation?: (href: string) => void;
};

export type OpenWebViewOptions = {
  href: string;
  title?: string;
  source?: string;
  presentation?: NavigatePayload["presentation"];
};

export type BackOptions = {
  fallbackHref?: string;
};

export type RouteChangedPayload = {
  path: string;
  title?: string;
  canGoBack?: boolean;
  fallbackTab?: HybridTabKey;
};

export const tabRootPath: Record<HybridTabKey, string> = {
  home: "/",
  promotion: "/promotion",
  mine: "/mine"
};

export function createHybridNavigator(options: HybridNavigatorOptions = {}) {
  const bridge = options.bridge ?? createWindowProtocolBridge();
  const locationRef = options.location ?? getWindowLocation();
  const historyRef = options.history ?? getWindowHistory();
  const assignLocation = options.assignLocation ?? defaultAssignLocation;

  function openWebView({ href, presentation, source, title }: OpenWebViewOptions) {
    const url = buildH5Url(href, locationRef);
    if (bridge.isAvailable()) {
      bridge.navigate({
        route: "webview",
        params: {
          url,
          path: normalizeRouteHref(href),
          title,
          source
        },
        presentation: presentation ?? { style: "push", animated: true }
      });
      return;
    }

    assignLocation(buildClientHref(href));
  }

  function switchTab(tab: HybridTabKey, options?: { closeCurrentWebView?: boolean }) {
    if (bridge.isAvailable()) {
      bridge.navigate({
        route: "tab",
        params: {
          tab,
          closeCurrentWebView: Boolean(options?.closeCurrentWebView)
        }
      });
      return;
    }

    assignLocation(buildClientHref(tabRootPath[tab]));
  }

  function closeWebView(options?: { fallbackHref?: string }) {
    if (bridge.isAvailable()) {
      bridge.navigate({ route: "close_webview" });
      return;
    }

    navigateBackOrFallback(options?.fallbackHref);
  }

  function back(options?: BackOptions) {
    if (bridge.isAvailable()) {
      bridge.navigate({ route: "back" });
      return;
    }

    navigateBackOrFallback(options?.fallbackHref);
  }

  function openNativePage(name: NativePageName, params: Record<string, unknown> = {}) {
    if (bridge.isAvailable()) {
      bridge.navigate({
        route: name,
        ...(Object.keys(params).length === 0 ? {} : { params })
      });
      return;
    }

    if (name === "settings") {
      assignLocation(buildClientHref("/mine"));
    }
  }

  function reportRouteChanged(payload: RouteChangedPayload) {
    if (!bridge.isAvailable()) {
      return;
    }

    bridge.emit("route_changed", payload);
  }

  function navigateBackOrFallback(fallbackHref?: string) {
    if (historyRef && historyRef.length > 1) {
      historyRef.back();
      return;
    }

    assignLocation(buildClientHref(fallbackHref ?? "/"));
  }

  return {
    back,
    closeWebView,
    isNativeAvailable: () => bridge.isAvailable(),
    openNativePage,
    openWebView,
    reportRouteChanged,
    switchTab
  };
}

export type HybridNavigator = ReturnType<typeof createHybridNavigator>;

export function buildH5Url(href: string, locationRef: Pick<Location, "origin"> | undefined = getWindowLocation()): string {
  if (isAbsoluteUrl(href)) {
    return href;
  }

  const origin = locationRef?.origin ?? "";
  return `${origin}${buildClientHref(href)}`;
}

export function buildClientHref(href: string): string {
  if (isAbsoluteUrl(href) || href.startsWith("#")) {
    return href;
  }

  const normalizedHref = normalizeRouteHref(href);
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_H5_BASE_PATH);
  if (!basePath || normalizedHref === basePath || normalizedHref.startsWith(`${basePath}/`)) {
    return normalizedHref;
  }

  if (normalizedHref === "/") {
    return `${basePath}/`;
  }

  return `${basePath}${normalizedHref}`;
}

export function inferFallbackTab(path: string): HybridTabKey {
  if (path === "/mine" || path.startsWith("/mine/") || path.startsWith("/orders") || path.startsWith("/favorites")) {
    return "mine";
  }

  if (path === "/promotion" || path.startsWith("/promotion/")) {
    return "promotion";
  }

  return "home";
}

export function normalizeRouteHref(href: string): string {
  if (!href) {
    return "/";
  }

  if (isAbsoluteUrl(href)) {
    const url = new URL(href);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return href.startsWith("/") || href.startsWith("#") ? href : `/${href}`;
}

function normalizeBasePath(value: string | undefined): string {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  if (!normalized) {
    return "";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function getWindowLocation() {
  return typeof window === "undefined" ? undefined : window.location;
}

function getWindowHistory() {
  return typeof window === "undefined" ? undefined : window.history;
}

function defaultAssignLocation(href: string) {
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
}
