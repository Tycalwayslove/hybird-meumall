export type BridgePlatform = "ios" | "android" | "web";

export type BridgeMethodMap = {
  "app.getVersion": {
    request: undefined;
    response: {
      appVersion: string;
      platform: BridgePlatform;
      channel: string;
      bridgeVersion?: string;
    };
  };
  "user.getToken": {
    request: undefined;
    response: {
      token: string | null;
      expiresAt: string | null;
    };
  };
  "webview.close": {
    request: undefined;
    response: {
      closed: boolean;
    };
  };
  "webview.setTitle": {
    request: {
      title: string;
    };
    response: {
      applied: boolean;
    };
  };
};

export type BridgeMethod = keyof BridgeMethodMap;
export type BridgeRequest<TMethod extends BridgeMethod> = BridgeMethodMap[TMethod]["request"];
export type BridgeResponse<TMethod extends BridgeMethod> = BridgeMethodMap[TMethod]["response"];

export type BridgeErrorCode = "BRIDGE_UNAVAILABLE" | "METHOD_NOT_FOUND" | "TIMEOUT" | "NATIVE_ERROR";

export type BridgeError = {
  code: BridgeErrorCode;
  message: string;
  nativeCode?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};

export type BridgeResult<T> = { ok: true; data: T } | { ok: false; error: BridgeError };

export type BridgeCallOptions = {
  timeoutMs?: number;
};

export type NativeBridgeAdapter = {
  canCall(method: BridgeMethod): boolean;
  call<TMethod extends BridgeMethod>(
    method: TMethod,
    payload: BridgeRequest<TMethod>
  ): Promise<BridgeResponse<TMethod>>;
};

export type NativeBridge = {
  canCall(method: BridgeMethod): boolean;
  call<TMethod extends BridgeMethod>(
    method: TMethod,
    ...args: BridgeRequest<TMethod> extends undefined
      ? [payload?: undefined, options?: BridgeCallOptions]
      : [payload: BridgeRequest<TMethod>, options?: BridgeCallOptions]
  ): Promise<BridgeResult<BridgeResponse<TMethod>>>;
};
