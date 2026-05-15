import type { BridgeMethod, BridgeRequest, BridgeResponse, NativeBridgeAdapter } from "./types";

const supportedMethods = new Set<BridgeMethod>([
  "app.getVersion",
  "user.getToken",
  "webview.close",
  "webview.setTitle"
]);

export type WebBridgeMockOptions = {
  appVersion?: string;
  platform?: "ios" | "android" | "web";
  channel?: string;
  bridgeVersion?: string;
  token?: string | null;
  tokenExpiresAt?: string | null;
};

export function createWebBridgeAdapter(options: WebBridgeMockOptions = {}): NativeBridgeAdapter {
  return {
    canCall(method) {
      return supportedMethods.has(method);
    },
    async call<TMethod extends BridgeMethod>(
      method: TMethod,
      payload: BridgeRequest<TMethod>
    ): Promise<BridgeResponse<TMethod>> {
      switch (method) {
        case "app.getVersion":
          return {
            appVersion: options.appVersion ?? "0.0.0",
            platform: options.platform ?? "web",
            channel: options.channel ?? "local",
            bridgeVersion: options.bridgeVersion
          } as BridgeResponse<TMethod>;
        case "user.getToken":
          return {
            token: options.token ?? null,
            expiresAt: options.tokenExpiresAt ?? null
          } as BridgeResponse<TMethod>;
        case "webview.close":
          return { closed: true } as BridgeResponse<TMethod>;
        case "webview.setTitle":
          return { applied: Boolean((payload as BridgeRequest<"webview.setTitle">).title) } as BridgeResponse<TMethod>;
        default:
          throw new Error(`Unsupported mock bridge method: ${method}`);
      }
    }
  };
}
