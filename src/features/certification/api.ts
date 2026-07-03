import type { H5BffResult, H5RequestOptions } from "@/lib/http";
import type { CertificationApplyUrlData, CertificationMemberInfoData } from "./types";

export type CertificationHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export function createCertificationApi(client: CertificationHttpClient) {
  return {
    getApplyUrl(name: string, authToken?: string | null) {
      return client.request<CertificationApplyUrlData>(`/api/bff/certification/apply-url?${new URLSearchParams({ name }).toString()}`, {
        headers: buildAuthHeaders(authToken)
      });
    },
    getMemberInfo(authToken?: string | null) {
      return client.request<CertificationMemberInfoData>("/api/bff/certification/member-info", {
        headers: buildAuthHeaders(authToken)
      });
    }
  };
}

function buildAuthHeaders(authToken?: string | null): HeadersInit | undefined {
  const token = authToken?.trim();
  return token ? { "x-meumall-auth-token": token } : undefined;
}

export type CertificationApi = ReturnType<typeof createCertificationApi>;
