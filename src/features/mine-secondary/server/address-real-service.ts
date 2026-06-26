import { createApiError } from "@/lib/api/errors";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import type { AddressEntry } from "../mock/address-data";

export type JavaAddress = {
  addr?: string | null;
  addrId?: number | string | null;
  area?: string | null;
  areaId?: number | string | null;
  city?: string | null;
  cityId?: number | string | null;
  commonAddr?: number | string | boolean | null;
  lat?: number | string | null;
  lng?: number | string | null;
  mobile?: string | null;
  province?: string | null;
  provinceId?: number | string | null;
  receiver?: string | null;
};

export type JavaAddressRegion = {
  areaId?: number | string | null;
  areaName?: string | null;
  [key: string]: unknown;
};

export type JavaAddressEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
};

export type AddressListBffData = {
  view: {
    addresses: AddressEntry[];
  };
  modules: {
    addressList: JavaAddress[];
  };
};

export type AddressSaveBffData = {
  view: {
    addrId?: string;
    message: string;
    status: "saved";
  };
  modules: {
    address?: JavaAddress;
    raw: unknown;
  };
};

export type AddressMutationBffData = {
  view: {
    message: string;
    status: "ok";
  };
};

export type AddressRegionsBffData = {
  view: {
    regions: Array<{
      areaId: number | string;
      areaName: string;
    }>;
  };
  modules: {
    regions: JavaAddressRegion[];
  };
};

type AddressBackendClient = {
  request<T>(options: BackendRequestOptions): Promise<BackendApiResult<T>>;
};

type AddressServiceOptions = {
  authToken: string | null;
  backendClient: AddressBackendClient;
  route: string;
};

export async function fetchAddressRegions({
  authToken,
  backendClient,
  parentId,
  route
}: AddressServiceOptions & { parentId?: string | null }): Promise<BackendApiResult<AddressRegionsBffData>> {
  const query = parentId ? new URLSearchParams({ pid: parentId }) : new URLSearchParams({ level: "1" });
  const response = await backendClient.request<JavaAddressEnvelope<JavaAddressRegion[]>>({
    authRequired: false,
    authToken,
    backend: "java",
    path: `/p/area/listByPid?${query.toString()}`,
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = response.data;
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? "省市区数据获取失败。",
        requestId: response.meta.requestId
      })
    };
  }

  const regions = Array.isArray(envelope.data) ? envelope.data : [];
  return {
    ok: true,
    data: {
      modules: {
        regions
      },
      view: {
        regions: regions.map(mapAddressRegion).filter((region) => region.areaName)
      }
    },
    meta: response.meta
  };
}

export async function fetchAddressList({ authToken, backendClient, route }: AddressServiceOptions): Promise<BackendApiResult<AddressListBffData>> {
  const response = await backendClient.request<JavaAddressEnvelope<JavaAddress[]>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: "/p/address/list?isDefaultFirst=false",
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = response.data;
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? "地址列表获取失败。",
        requestId: response.meta.requestId
      })
    };
  }

  const addressList = Array.isArray(envelope.data) ? envelope.data : [];
  return {
    ok: true,
    data: {
      modules: {
        addressList
      },
      view: {
        addresses: addressList.map(mapAddressEntry).filter((address) => address.addrId)
      }
    },
    meta: response.meta
  };
}

export async function fetchAddressInfo({
  addrId,
  authToken,
  backendClient,
  route
}: AddressServiceOptions & { addrId: string }): Promise<BackendApiResult<AddressEntry | null>> {
  const response = await backendClient.request<JavaAddressEnvelope<JavaAddress>>({
    authRequired: true,
    authToken,
    backend: "java",
    path: `/p/address/addrInfo/${addrId}`,
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = response.data;
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? "地址详情获取失败。",
        requestId: response.meta.requestId
      })
    };
  }

  return {
    ok: true,
    data: envelope.data ? mapAddressEntry(envelope.data) : null,
    meta: response.meta
  };
}

export async function saveAddress({
  address,
  authToken,
  backendClient,
  route
}: AddressServiceOptions & { address: JavaAddress }): Promise<BackendApiResult<AddressSaveBffData>> {
  const hasAddressId = normalizeText(address.addrId, "");
  const response = await backendClient.request<JavaAddressEnvelope<JavaAddress | string>>({
    authRequired: true,
    authToken,
    backend: "java",
    body: normalizeAddressPayload(address),
    method: hasAddressId ? "PUT" : "POST",
    path: hasAddressId ? "/p/address/updateAddr" : "/p/address/addAddr",
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = response.data;
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? "地址保存失败。",
        requestId: response.meta.requestId
      })
    };
  }

  return {
    ok: true,
    data: {
      modules: {
        address: typeof envelope.data === "object" && envelope.data !== null ? envelope.data : undefined,
        raw: envelope.data
      },
      view: {
        ...(hasAddressId ? { addrId: hasAddressId } : {}),
        message: typeof envelope.data === "string" ? envelope.data : envelope.msg ?? "地址已保存。",
        status: "saved"
      }
    },
    meta: response.meta
  };
}

export async function setDefaultAddress({
  addrId,
  authToken,
  backendClient,
  route
}: AddressServiceOptions & { addrId: string }): Promise<BackendApiResult<AddressMutationBffData>> {
  return mutateAddress({
    authToken,
    backendClient,
    method: "PUT",
    path: `/p/address/defaultAddr/${addrId}`,
    route,
    successMessage: "默认地址已更新。"
  });
}

export async function deleteAddress({
  addrId,
  authToken,
  backendClient,
  route
}: AddressServiceOptions & { addrId: string }): Promise<BackendApiResult<AddressMutationBffData>> {
  return mutateAddress({
    authToken,
    backendClient,
    method: "DELETE",
    path: `/p/address/deleteAddr/${addrId}`,
    route,
    successMessage: "地址已删除。"
  });
}

async function mutateAddress({
  authToken,
  backendClient,
  method,
  path,
  route,
  successMessage
}: AddressServiceOptions & { method: "DELETE" | "PUT"; path: string; successMessage: string }): Promise<BackendApiResult<AddressMutationBffData>> {
  const response = await backendClient.request<JavaAddressEnvelope<unknown>>({
    authRequired: true,
    authToken,
    backend: "java",
    method,
    path,
    route
  });

  if (!response.ok) {
    return response;
  }

  const envelope = response.data;
  if (!isJavaSuccess(envelope)) {
    return {
      ok: false,
      error: createApiError("HTTP_ERROR", {
        details: { response: envelope },
        message: envelope.msg ?? successMessage,
        requestId: response.meta.requestId
      })
    };
  }

  return {
    ok: true,
    data: {
      view: {
        message: envelope.msg ?? successMessage,
        status: "ok"
      }
    },
    meta: response.meta
  };
}

function mapAddressEntry(address: JavaAddress): AddressEntry {
  return {
    addr: normalizeText(address.addr, ""),
    addrId: normalizeText(address.addrId, ""),
    area: normalizeText(address.area, ""),
    city: normalizeText(address.city, ""),
    commonAddr: normalizeCommonAddress(address.commonAddr),
    mobile: normalizeText(address.mobile, ""),
    province: normalizeText(address.province, ""),
    receiver: normalizeText(address.receiver, "")
  };
}

function mapAddressRegion(region: JavaAddressRegion) {
  return {
    areaId: normalizeText(region.areaId, ""),
    areaName: normalizeText(region.areaName, "")
  };
}

function normalizeAddressPayload(address: JavaAddress) {
  return {
    ...(address.addrId === undefined || address.addrId === null || address.addrId === "" ? {} : { addrId: address.addrId }),
    addr: normalizeText(address.addr, ""),
    area: normalizeText(address.area, ""),
    areaId: normalizeOptionalNumber(address.areaId),
    city: normalizeText(address.city, ""),
    cityId: normalizeOptionalNumber(address.cityId),
    commonAddr: normalizeCommonAddress(address.commonAddr),
    lat: normalizeText(address.lat, ""),
    lng: normalizeText(address.lng, ""),
    mobile: normalizeText(address.mobile, "").replace(/\s+/g, ""),
    province: normalizeText(address.province, ""),
    provinceId: normalizeOptionalNumber(address.provinceId),
    receiver: normalizeText(address.receiver, ""),
    userType: 0
  };
}

function isJavaSuccess<T>(response: JavaAddressEnvelope<T>) {
  return response.success !== false && (!response.code || response.code === "00000" || response.code === "A00000");
}

function normalizeText(value: unknown, fallback: string) {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function normalizeCommonAddress(value: JavaAddress["commonAddr"]): 0 | 1 {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

function normalizeOptionalNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
