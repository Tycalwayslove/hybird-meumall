export type BridgeModule = "router" | "event" | "rpc";

export type BridgeRoute = "home" | "back" | "product_detail" | "webview" | "tab" | "close_webview" | "native_page";
export type PresentationStyle = "push" | "present" | "sheet" | "fullscreen";

export type NavigatePayload = {
  route: BridgeRoute;
  params?: Record<string, unknown>;
  presentation?: {
    style: PresentationStyle;
    animated?: boolean;
  };
};

export type NativeEventMap = {
  token_expired: { reason?: string };
  share: { productId: string; title?: string; source?: string };
  route_changed: {
    path: string;
    title?: string;
    canGoBack?: boolean;
    fallbackTab?: "home" | "promotion" | "mine";
  };
};

export type NativeEventName = keyof NativeEventMap;

export type WebEventMap = {
  logout: { reason?: string };
};

export type WebEventName = keyof WebEventMap;

export type RpcResponseMap = {
  getTokens: {
    accessToken: string;
    mallToken: string;
    expiredAt: number;
  };
  getDeviceInfo: {
    platform: "ios" | "android" | "web";
    version: string;
    build: string;
    bridgeVersion?: string;
    supportedActions?: string[];
  };
};

export type RpcRequestMap = {
  getTokens: undefined;
  getDeviceInfo: undefined;
};

export type RpcName = keyof RpcResponseMap;

export type BridgeErrorCode =
  | "unknown"
  | "timeout"
  | "cancelled"
  | "permission_denied"
  | "unsupported"
  | "invalid_payload"
  | "no_native_bridge"
  | "post_failed";

export class BridgeRPCError extends Error {
  constructor(
    readonly code: BridgeErrorCode,
    message: string
  ) {
    super(message);
    this.name = "BridgeRPCError";
  }
}

export type BridgeMessage<TPayload = unknown> = {
  module: BridgeModule;
  action: string;
  payload?: TPayload;
  callbackId?: string;
};

export type BridgeReplyNamespace = {
  resolve(callbackId: string, data: unknown): void;
  reject(callbackId: string, code: BridgeErrorCode, message: string): void;
  emit<E extends WebEventName>(eventName: E, payload: WebEventMap[E]): void;
};

export type ProtocolBridge = {
  readonly reply: BridgeReplyNamespace;
  isAvailable(): boolean;
  navigate(payload: NavigatePayload): void;
  emit<E extends NativeEventName>(eventName: E, payload: NativeEventMap[E]): void;
  rpc<R extends RpcName>(
    action: R,
    ...args: RpcRequestMap[R] extends undefined ? [payload?: undefined] : [payload: RpcRequestMap[R]]
  ): Promise<RpcResponseMap[R]>;
  on<E extends WebEventName>(eventName: E, handler: (payload: WebEventMap[E]) => void): () => void;
};

export type ProtocolBridgeOptions = {
  postMessage?: (message: BridgeMessage) => void;
  createCallbackId?: () => string;
  timeoutMs?: number;
  replyHost?: BridgeReplyHost;
};

export type BridgeReplyHost = {
  __bridgeHandler?: BridgeReplyNamespace;
};

type PendingCallback = {
  resolve(value: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
};

type WebEventHandlers = {
  [K in WebEventName]?: Set<(payload: WebEventMap[K]) => void>;
};

const defaultTimeoutMs = 3000;

export function createProtocolBridge(options: ProtocolBridgeOptions = {}): ProtocolBridge {
  const pending = new Map<string, PendingCallback>();
  const webEventHandlers: WebEventHandlers = {};
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  const postMessage = options.postMessage ?? createWindowPostMessage();
  const createCallbackId = options.createCallbackId ?? defaultCallbackId;

  const reply: BridgeReplyNamespace = {
    resolve(callbackId, data) {
      const callback = pending.get(callbackId);
      if (!callback) {
        return;
      }

      clearTimeout(callback.timer);
      pending.delete(callbackId);
      callback.resolve(data);
    },
    reject(callbackId, code, message) {
      const callback = pending.get(callbackId);
      if (!callback) {
        return;
      }

      clearTimeout(callback.timer);
      pending.delete(callbackId);
      callback.reject(new BridgeRPCError(code, message));
    },
    emit(eventName, payload) {
      webEventHandlers[eventName]?.forEach((handler) => {
        handler(payload as never);
      });
    }
  };

  if (options.replyHost) {
    options.replyHost.__bridgeHandler = reply;
  } else if (typeof window !== "undefined") {
    (window as BridgeReplyHost).__bridgeHandler = reply;
  }

  function post(message: BridgeMessage) {
    if (!postMessage) {
      throw new BridgeRPCError("no_native_bridge", "Native bridge is not available.");
    }

    try {
      postMessage(message);
    } catch (error) {
      if (error instanceof BridgeRPCError) {
        throw error;
      }
      throw new BridgeRPCError("post_failed", error instanceof Error ? error.message : "Bridge postMessage failed.");
    }
  }

  return {
    reply,
    isAvailable() {
      return Boolean(postMessage);
    },
    navigate(payload) {
      post({ module: "router", action: "navigate", payload });
    },
    emit(eventName, payload) {
      post({ module: "event", action: eventName, payload });
    },
    rpc(action, payload) {
      const callbackId = createCallbackId();
      const message: BridgeMessage = payload === undefined ? { module: "rpc", action, callbackId } : { module: "rpc", action, payload, callbackId };

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(callbackId);
          reject(new BridgeRPCError("timeout", `Bridge RPC ${action} timed out.`));
        }, timeoutMs);

        pending.set(callbackId, { resolve, reject, timer });

        try {
          post(message);
        } catch (error) {
          clearTimeout(timer);
          pending.delete(callbackId);
          reject(error);
        }
      }) as Promise<RpcResponseMap[typeof action]>;
    },
    on(eventName, handler) {
      const handlers = (webEventHandlers[eventName] ??= new Set()) as Set<typeof handler>;
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    }
  };
}

export function createWindowProtocolBridge(): ProtocolBridge {
  return createProtocolBridge();
}

function createWindowPostMessage(): ((message: BridgeMessage) => void) | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const host = window as WindowBridgeHost;
  const iosHandler = host.webkit?.messageHandlers?.bridgeHandler;
  if (iosHandler) {
    return (message) => iosHandler.postMessage(message);
  }

  const androidHandler = host.bridgeHandler;
  if (androidHandler) {
    return (message) => androidHandler.postMessage(JSON.stringify(message));
  }

  return undefined;
}

function defaultCallbackId() {
  return `cb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type WindowBridgeHost = Window & {
  webkit?: {
    messageHandlers?: {
      bridgeHandler?: {
        postMessage(message: BridgeMessage): void;
      };
    };
  };
  bridgeHandler?: {
    postMessage(message: string): void;
  };
};
