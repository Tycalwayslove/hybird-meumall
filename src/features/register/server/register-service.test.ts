import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { fetchRegisterAesKey, sendRegisterSms, submitRegister } from "./register-service";

describe("register service", () => {
  test("adds Version header only to the submit register backend request", async () => {
    const request = vi.fn(async (options: BackendRequestOptions) => {
      return {
        ok: true,
        data:
          options.path === "/user/get_aes_key"
            ? { data: { key_data: "encrypted-key", key_str: "decode-key" }, status: "ok" }
            : { status: "ok" },
        meta: {
          requestId: "req-register",
          route: "/register",
          h5Version: "test",
          appEnv: "test",
          backend: "python"
        }
      } as BackendApiResult<unknown>;
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const backendClient = { request };

    await fetchRegisterAesKey({ backendClient });
    await sendRegisterSms({ backendClient, phone: "13800138000" });
    await submitRegister({ backendClient, payload: { data: "encrypted-payload" } });

    expect(request).toHaveBeenNthCalledWith(
      1,
      expect.not.objectContaining({
        headers: expect.anything()
      })
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      expect.not.objectContaining({
        headers: expect.anything()
      })
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        headers: {
          Version: "1.5.1"
        },
        path: "/user/regist"
      })
    );
  });
});
