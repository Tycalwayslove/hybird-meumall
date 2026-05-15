import type { BridgeMethod, BridgeRequest, BridgeResponse, NativeBridgeAdapter } from "./types";

export type NativeBridgeHost = {
  MeumallNativeBridge?: {
    canCall?: (method: string) => boolean;
    call: (method: string, payload: unknown) => Promise<unknown> | unknown;
  };
};

export function createNativeWindowBridgeAdapter(host: NativeBridgeHost | undefined = getDefaultHost()): NativeBridgeAdapter | undefined {
  const nativeBridge = host?.MeumallNativeBridge;
  if (!nativeBridge) {
    return undefined;
  }

  return {
    canCall(method) {
      return nativeBridge.canCall ? nativeBridge.canCall(method) : true;
    },
    async call<TMethod extends BridgeMethod>(
      method: TMethod,
      payload: BridgeRequest<TMethod>
    ): Promise<BridgeResponse<TMethod>> {
      return (await nativeBridge.call(method, payload)) as BridgeResponse<TMethod>;
    }
  };
}

function getDefaultHost(): NativeBridgeHost | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window as NativeBridgeHost;
}
