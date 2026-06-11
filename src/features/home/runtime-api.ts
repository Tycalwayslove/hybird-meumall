import type { H5BffResult } from "@/lib/http";
import type { NativeRuntimeContext } from "@/server/runtime/native-context";

export type RuntimeHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export function createRuntimeApi(client: RuntimeHttpClient) {
  return {
    getNativeRuntimeContext(sourceSearch = "") {
      return client.request<NativeRuntimeContext>(buildNativeRuntimeContextPath(sourceSearch));
    }
  };
}

export function buildNativeRuntimeContextPath(sourceSearch = "") {
  return sourceSearch
    ? `/api/bff/runtime/context?sourceSearch=${encodeURIComponent(sourceSearch)}`
    : "/api/bff/runtime/context";
}
