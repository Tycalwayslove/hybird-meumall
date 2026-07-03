import type { H5BffResult, H5RequestOptions } from "@/lib/http";
import type { RegisterAesKeyData, RegisterBackendEnvelope, RegisterEncryptedPayload } from "./types";

export type RegisterHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export function createRegisterApi(client: RegisterHttpClient) {
  return {
    getAesKey() {
      return client.request<RegisterAesKeyData>("/api/bff/register/aes-key");
    },
    sendSms(phone: string) {
      return client.request<RegisterBackendEnvelope<null>>("/api/bff/register/send-sms", {
        body: { phone },
        method: "POST"
      });
    },
    register(payload: RegisterEncryptedPayload) {
      return client.request<RegisterBackendEnvelope>("/api/bff/register", {
        body: payload,
        method: "POST"
      });
    }
  };
}

export type RegisterApi = ReturnType<typeof createRegisterApi>;
