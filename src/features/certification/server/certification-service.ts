import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import type {
  CertificationApplyUrlData,
  CertificationApplyUrlResponse,
  CertificationJavaEnvelope,
  CertificationMemberInfo,
  CertificationMemberInfoData
} from "../types";

type CertificationBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

export async function fetchCertificationApplyUrl({
  authToken,
  backendClient,
  name,
  route
}: {
  authToken: string | null;
  backendClient: CertificationBackendClient;
  name: string;
  route: string;
}): Promise<BackendApiResult<CertificationApplyUrlData>> {
  const realName = name.trim();
  if (!realName) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        message: "请输入真实姓名",
        recoverable: true
      })
    };
  }

  const query = new URLSearchParams({ name: realName });
  const result = await requestJava<CertificationApplyUrlResponse>({
    authToken,
    backendClient,
    fallbackMessage: "获取实名认证链接失败",
    path: `/p/allinpay/member/getCreateMemberApplyUrl?${query.toString()}`,
    route
  });
  if (!result.ok) {
    return result;
  }

  const applyUrl = normalizeText(result.data?.regInviteLink);
  if (!applyUrl) {
    return {
      ok: false,
      error: createApiError("PARSE_ERROR", {
        details: { response: result.data },
        message: normalizeText(result.data?.respMsg) || "实名认证链接为空",
        requestId: result.meta.requestId,
        recoverable: true
      })
    };
  }

  return {
    ok: true,
    data: {
      modules: {
        raw: result.data
      },
      view: {
        applyUrl,
        message: normalizeText(result.data?.respMsg) || "实名认证链接获取成功"
      }
    },
    meta: result.meta
  };
}

export async function fetchCertificationMemberInfo({
  authToken,
  backendClient,
  route
}: {
  authToken: string | null;
  backendClient: CertificationBackendClient;
  route: string;
}): Promise<BackendApiResult<CertificationMemberInfoData>> {
  const result = await requestJava<CertificationMemberInfo>({
    authToken,
    backendClient,
    fallbackMessage: "查询认证结果失败",
    path: "/p/allinpay/member/getMemberBasicInfoV2",
    route
  });
  if (!result.ok) {
    return result;
  }

  const member = result.data ?? {};
  const phone = normalizeText(member.phone);
  const isRealNameAuth = normalizeText(member.isRealNameAuth);
  const isWithdraw = normalizeText(member.isWithdraw);
  const success = Boolean(phone) && isRealNameAuth === "1" && isWithdraw === "1";

  return {
    ok: true,
    data: {
      modules: {
        member
      },
      view: {
        memberName: normalizeText(member.memberName, normalizeText(member.name, "喵呜达人")),
        reason: success ? "" : resolveFailureReason({ phone, isRealNameAuth, isWithdraw }),
        success
      }
    },
    meta: result.meta
  };
}

async function requestJava<T>({
  authToken,
  backendClient,
  fallbackMessage,
  path,
  route
}: {
  authToken: string | null;
  backendClient: CertificationBackendClient;
  fallbackMessage: string;
  path: string;
  route: string;
}): Promise<BackendApiResult<T>> {
  const response = await backendClient.request<CertificationJavaEnvelope<T>>({
    authRequired: true,
    authToken,
    backend: "java",
    path,
    route
  });
  if (!response.ok) {
    return response;
  }

  return unwrapJavaEnvelope(response.data, response.meta.requestId, route, fallbackMessage);
}

function unwrapJavaEnvelope<T>(
  envelope: CertificationJavaEnvelope<T>,
  requestId: string | undefined,
  route: string,
  fallbackMessage: string
): BackendApiResult<T> {
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? fallbackMessage,
        requestId,
        recoverable: true
      })
    };
  }

  return {
    ok: true,
    data: envelope.data as T,
    meta: {
      appEnv: process.env.APP_ENV ?? "unknown",
      backend: "java",
      h5Version: process.env.H5_VERSION ?? "unknown",
      requestId: requestId ?? "unknown",
      route
    }
  };
}

function isJavaSuccess(envelope: CertificationJavaEnvelope<unknown>) {
  return envelope.success === true || envelope.code === "00000" || envelope.code === "A00000";
}

function resolveFailureReason({
  isRealNameAuth,
  isWithdraw,
  phone
}: {
  isRealNameAuth: string;
  isWithdraw: string;
  phone: string;
}) {
  if (!phone) {
    return "会员手机号缺失";
  }
  if (isRealNameAuth !== "1") {
    return "实名认证未完成";
  }
  if (isWithdraw !== "1") {
    return "银行卡绑定未完成";
  }
  return "认证状态未完成";
}

function normalizeText(value: unknown, fallback = "") {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text || fallback;
}
