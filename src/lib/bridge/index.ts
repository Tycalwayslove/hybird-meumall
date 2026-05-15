import { createBridgeError } from "./errors";
import { createNativeWindowBridgeAdapter } from "./native-adapter";
import type {
  BridgeCallOptions,
  BridgeMethod,
  BridgeRequest,
  BridgeResponse,
  BridgeResult,
  NativeBridge,
  NativeBridgeAdapter
} from "./types";

const defaultTimeoutMs = 3000;

export type NativeBridgeOptions = {
  adapter?: NativeBridgeAdapter;
  timeoutMs?: number;
};

export function createNativeBridge(options: NativeBridgeOptions = {}): NativeBridge {
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;

  return {
    canCall(method) {
      return Boolean(options.adapter?.canCall(method));
    },
    async call<TMethod extends BridgeMethod>(
      method: TMethod,
      ...args: BridgeRequest<TMethod> extends undefined
        ? [payload?: undefined, callOptions?: BridgeCallOptions]
        : [payload: BridgeRequest<TMethod>, callOptions?: BridgeCallOptions]
    ): Promise<BridgeResult<BridgeResponse<TMethod>>> {
      const payload = args[0] as BridgeRequest<TMethod>;
      const callOptions = args[1] as BridgeCallOptions | undefined;

      if (!options.adapter) {
        return { ok: false, error: createBridgeError("BRIDGE_UNAVAILABLE") };
      }

      if (!options.adapter.canCall(method)) {
        return {
          ok: false,
          error: createBridgeError("METHOD_NOT_FOUND", {
            details: { method }
          })
        };
      }

      try {
        const data = await withTimeout(
          options.adapter.call(method, payload),
          callOptions?.timeoutMs ?? timeoutMs
        );
        return { ok: true, data };
      } catch (error) {
        if (error instanceof BridgeTimeoutError) {
          return {
            ok: false,
            error: createBridgeError("TIMEOUT", {
              details: { method, timeoutMs: callOptions?.timeoutMs ?? timeoutMs }
            })
          };
        }

        return {
          ok: false,
          error: createBridgeError("NATIVE_ERROR", {
            message: error instanceof Error ? error.message : undefined,
            recoverable: false,
            details: { method }
          })
        };
      }
    }
  };
}

class BridgeTimeoutError extends Error {
  constructor() {
    super("Bridge call timed out.");
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new BridgeTimeoutError()), timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export const nativeBridge = createNativeBridge({
  adapter: createNativeWindowBridgeAdapter()
});

export const bridgeRuntimeBoundary = {
  name: "Native Bridge",
  status: "web mock and native adapter boundary"
} as const;

export { createBridgeError } from "./errors";
export { createNativeWindowBridgeAdapter, type NativeBridgeHost } from "./native-adapter";
export type {
  BridgeCallOptions,
  BridgeError,
  BridgeErrorCode,
  BridgeMethod,
  BridgeMethodMap,
  BridgePlatform,
  BridgeRequest,
  BridgeResponse,
  BridgeResult,
  NativeBridge,
  NativeBridgeAdapter
} from "./types";
export { createWebBridgeAdapter, type WebBridgeMockOptions } from "./web-mock";
