import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { fetchCertificationApplyUrl, fetchCertificationMemberInfo } from "./certification-service";

function createBackendClient(responseData: unknown) {
  const request = vi.fn(async () => {
    return {
      ok: true,
      data: responseData,
      meta: {
        requestId: "req-certification",
        route: "/register/certification",
        h5Version: "test",
        appEnv: "test",
        backend: "java"
      }
    } as BackendApiResult<unknown>;
  }) as unknown as (<T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>) & ReturnType<typeof vi.fn>;

  return {
    backendClient: { request },
    request
  };
}

describe("certification service", () => {
  test("requests member apply url with name and Java auth token", async () => {
    const { backendClient, request } = createBackendClient({
      code: "00000",
      data: {
        regInviteLink: "https://allinpay.example.com/apply",
        respMsg: "ok"
      },
      success: true
    });

    const result = await fetchCertificationApplyUrl({
      authToken: "java-token",
      backendClient,
      name: "深圳喵小喵",
      route: "/register/certification/name"
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          view: {
            applyUrl: "https://allinpay.example.com/apply",
            message: "ok"
          }
        })
      })
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        authRequired: true,
        authToken: "java-token",
        backend: "java",
        path: "/p/allinpay/member/getCreateMemberApplyUrl?name=%E6%B7%B1%E5%9C%B3%E5%96%B5%E5%B0%8F%E5%96%B5"
      })
    );
  });

  test("marks certification successful only when phone, real name auth and withdraw are all ready", async () => {
    const { backendClient } = createBackendClient({
      code: "00000",
      data: {
        isRealNameAuth: "1",
        isWithdraw: "1",
        memberName: "深圳喵小喵",
        phone: "13800138000"
      },
      success: true
    });

    const result = await fetchCertificationMemberInfo({
      authToken: "java-token",
      backendClient,
      route: "/register/certification/result"
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          view: {
            memberName: "深圳喵小喵",
            reason: "",
            success: true
          }
        })
      })
    );
  });

  test("returns an unfinished reason when withdraw is not enabled", async () => {
    const { backendClient } = createBackendClient({
      code: "00000",
      data: {
        isRealNameAuth: "1",
        isWithdraw: "0",
        memberName: "深圳喵小喵",
        phone: "13800138000"
      },
      success: true
    });

    const result = await fetchCertificationMemberInfo({
      authToken: "java-token",
      backendClient,
      route: "/register/certification/result"
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          view: {
            memberName: "深圳喵小喵",
            reason: "银行卡绑定未完成",
            success: false
          }
        })
      })
    );
  });
});
