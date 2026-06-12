import { describe, expect, test, vi } from "vitest";
import type { H5BffResult } from "@/lib/http";
import type { NativeRuntimeContext } from "@/server/runtime/native-context";
import { createRuntimeApi } from "./runtime-api";
import type { RuntimeHttpClient } from "./runtime-api";

describe("runtime api", () => {
  test("loads native runtime context through the BFF adapter", async () => {
    const expectedResult = {
      success: true,
      data: makeNativeRuntimeContext(),
      requestId: "req-runtime"
    } satisfies H5BffResult<NativeRuntimeContext>;
    const client = makeClient(expectedResult);
    const api = createRuntimeApi(client);

    const result = await api.getNativeRuntimeContext("?from=native&scene=home");

    expect(client.request).toHaveBeenCalledWith("/api/bff/runtime/context?sourceSearch=%3Ffrom%3Dnative%26scene%3Dhome");
    expect(result).toBe(expectedResult);
  });

  test("omits sourceSearch when no source query is present", async () => {
    const expectedResult = {
      success: true,
      data: makeNativeRuntimeContext(),
      requestId: "req-runtime"
    } satisfies H5BffResult<NativeRuntimeContext>;
    const client = makeClient(expectedResult);
    const api = createRuntimeApi(client);

    await api.getNativeRuntimeContext("");

    expect(client.request).toHaveBeenCalledWith("/api/bff/runtime/context");
  });
});

function makeClient<T>(result: H5BffResult<T>): { request: RuntimeHttpClient["request"] & ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn(async () => result) as unknown as RuntimeHttpClient["request"] & ReturnType<typeof vi.fn>
  };
}

function makeNativeRuntimeContext(): NativeRuntimeContext {
  return {
    auth: {
      mallToken: { cookieName: "mallToken", length: 8, present: true, preview: "mall..." },
      pythonToken: { cookieName: "pythonToken", length: 5, present: true, preview: "py..." }
    },
    cookies: [],
    environment: {
      appEnv: "test",
      h5Version: "1.0.0",
      localTokenFallback: {
        enabled: false,
        javaTokenPresent: false,
        pythonTokenPresent: false
      }
    },
    pageConfig: null,
    sourceParams: {},
    statusBar: {
      statusHeight: null,
      statusHeightCookieName: "statusHeight"
    }
  };
}
