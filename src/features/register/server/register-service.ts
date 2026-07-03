import { createApiError } from "@/lib/api/errors";
import type { ClientRequestContext } from "@/lib/http/client-context";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import type { RegisterAesKeyData, RegisterBackendEnvelope, RegisterEncryptedPayload } from "../types";

type RegisterBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

const registerApiVersion = "1.5.1";

export type RegisterServiceOptions = {
  backendClient: RegisterBackendClient;
  clientContext?: ClientRequestContext;
};

export async function fetchRegisterAesKey({
  backendClient,
  clientContext
}: RegisterServiceOptions): Promise<BackendApiResult<RegisterAesKeyData>> {
  const result = await backendClient.request<RegisterBackendEnvelope<RegisterAesKeyData>>({
    authRequired: false,
    backend: "python",
    clientContext,
    method: "GET",
    path: "/user/get_aes_key",
    route: "/register"
  });

  if (!result.ok) {
    return result;
  }

  const envelope = unwrapEnvelope(result.data, result.meta.requestId);
  if (!envelope.ok) {
    return envelope;
  }

  const data = envelope.data.data;
  if (!data?.key_data || !data?.key_str) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "加密参数格式错误",
        requestId: result.meta.requestId,
        recoverable: true
      })
    };
  }

  return {
    ok: true,
    data,
    meta: result.meta
  };
}

export async function sendRegisterSms({
  backendClient,
  clientContext,
  phone
}: RegisterServiceOptions & { phone: string }): Promise<BackendApiResult<RegisterBackendEnvelope<null>>> {
  const result = await backendClient.request<RegisterBackendEnvelope<null>>({
    authRequired: false,
    backend: "python",
    body: { phone },
    clientContext,
    method: "POST",
    path: "/user/regist/send_sms",
    route: "/register"
  });

  if (!result.ok) {
    return result;
  }

  const envelope = unwrapEnvelope(result.data, result.meta.requestId);
  if (!envelope.ok) {
    return envelope;
  }

  return {
    ok: true,
    data: envelope.data,
    meta: result.meta
  };
}

export async function submitRegister({
  backendClient,
  clientContext,
  payload
}: RegisterServiceOptions & { payload: RegisterEncryptedPayload }): Promise<BackendApiResult<RegisterBackendEnvelope>> {
  const result = await backendClient.request<RegisterBackendEnvelope>({
    authRequired: false,
    backend: "python",
    body: payload,
    clientContext,
    headers: {
      Version: registerApiVersion
    },
    method: "POST",
    path: "/user/regist",
    route: "/register"
  });

  if (!result.ok) {
    return result;
  }

  const envelope = unwrapEnvelope(result.data, result.meta.requestId);
  if (!envelope.ok) {
    return envelope;
  }

  return {
    ok: true,
    data: envelope.data,
    meta: result.meta
  };
}

function unwrapEnvelope<T>(response: RegisterBackendEnvelope<T>, requestId: string): BackendApiResult<RegisterBackendEnvelope<T>> {
  if (response.status && response.status !== "ok") {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { status: response.status },
        message: response.msg || "请求失败",
        requestId,
        recoverable: true
      })
    };
  }

  return {
    ok: true,
    data: response,
    meta: {
      requestId,
      route: "/register",
      h5Version: process.env.H5_VERSION ?? "unknown",
      appEnv: process.env.APP_ENV ?? "unknown",
      backend: "python"
    }
  };
}
