import type { BridgeAddress, BridgeAddressLocation, ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import type { H5BffResult } from "@/lib/http";

import type { AddressApi } from "./api";
import type { AddressEntry } from "./mock/address-data";
import type { AddressListBffData, AddressMutationBffData, AddressSaveBffData, JavaAddress } from "./server/address-real-service";

type HybridAddressApiOptions = {
  bridge: ProtocolBridge;
  fallback: AddressApi;
  logger?: Pick<Console, "info" | "warn">;
};

export type AddressLocationResult = {
  addr: string;
  area: string;
  areaId?: number | string;
  city: string;
  cityId?: number | string;
  lat?: number | string;
  lng?: number | string;
  name?: string;
  province: string;
  provinceId?: number | string;
};

export type HybridAddressApi = ReturnType<typeof createHybridAddressApi>;

export function createHybridAddressApi({ bridge, fallback, logger = console }: HybridAddressApiOptions) {
  return {
    async chooseLocation() {
      logAddressLocation(logger, "info", "request address.chooseLocation");
      if (!bridge.isAvailable()) {
        logAddressLocation(logger, "warn", "address.chooseLocation unavailable");
        return failure<AddressLocationResult>("BRIDGE_UNAVAILABLE", "定位能力等待 App Bridge 接入。");
      }

      try {
        const response = await bridge.rpc("address.chooseLocation");
        logAddressLocation(logger, "info", "address.chooseLocation resolved");
        return success<AddressLocationResult | null>(response.location ? normalizeLocation(response.location) : null);
      } catch (error) {
        logAddressLocation(logger, "warn", `address.chooseLocation failed: ${error instanceof Error ? error.message : "unknown error"}`);
        return failure<AddressLocationResult>("BRIDGE_ERROR", "定位能力等待 App Bridge 接入。");
      }
    },
    deleteAddress(addrId: string) {
      return withFallback({
        bridge,
        fallback: () => fallback.deleteAddress(addrId),
        invoke: () => bridge.rpc("address.delete", { addrId }),
        map: (response) =>
          success<AddressMutationBffData>({
            view: {
              message: response.message ?? "地址已删除。",
              status: "ok"
            }
          })
      });
    },
    getAddressInfo(addrId: string) {
      return withFallback({
        bridge,
        fallback: () => fallback.getAddressInfo(addrId),
        invoke: () => bridge.rpc("address.getInfo", { addrId }),
        map: (response) => success<AddressEntry | null>(response.address ? normalizeAddress(response.address) : null)
      });
    },
    getAddressList() {
      return withFallback({
        bridge,
        fallback: () => fallback.getAddressList(),
        invoke: () => bridge.rpc("address.getList"),
        map: (response) =>
          success<AddressListBffData>({
            modules: {
              addressList: response.addresses ?? []
            },
            view: {
              addresses: (response.addresses ?? []).map(normalizeAddress).filter((address) => address.addrId)
            }
          })
      });
    },
    getAddressRegions(parentId?: string | number) {
      return fallback.getAddressRegions(parentId);
    },
    getDefaultAddress() {
      return withFallback({
        bridge,
        fallback: async () => {
          const result = await fallback.getAddressList();
          if (!result.success) {
            return result;
          }
          return success<AddressEntry | null>(result.data.view.addresses.find((address) => address.commonAddr === 1) ?? result.data.view.addresses[0] ?? null);
        },
        invoke: () => bridge.rpc("address.getDefault"),
        map: (response) => success<AddressEntry | null>(response.address ? normalizeAddress(response.address) : null)
      });
    },
    saveAddress(address: JavaAddress) {
      return withFallback({
        bridge,
        fallback: () => fallback.saveAddress(address),
        invoke: () => bridge.rpc("address.save", address),
        map: (response) =>
          success<AddressSaveBffData>({
            modules: {
              address: response.address ?? undefined,
              raw: response
            },
            view: {
              ...(response.addrId === undefined || response.addrId === null ? {} : { addrId: String(response.addrId) }),
              message: response.message ?? "地址已保存。",
              status: "saved"
            }
          })
      });
    },
    setDefaultAddress(addrId: string) {
      return withFallback({
        bridge,
        fallback: () => fallback.setDefaultAddress(addrId),
        invoke: () => bridge.rpc("address.setDefault", { addrId }),
        map: (response) =>
          success<AddressMutationBffData>({
            view: {
              message: response.message ?? "默认地址已更新。",
              status: "ok"
            }
          })
      });
    }
  };
}

async function withFallback<TBridge, TResult>({
  bridge,
  fallback,
  invoke,
  map
}: {
  bridge: ProtocolBridge;
  fallback: () => Promise<H5BffResult<TResult>>;
  invoke: () => Promise<TBridge>;
  map: (response: TBridge) => H5BffResult<TResult>;
}) {
  if (!bridge.isAvailable()) {
    return fallback();
  }

  try {
    return map(await invoke());
  } catch {
    return fallback();
  }
}

function success<T>(data: T): H5BffResult<T> {
  return {
    data,
    requestId: "bridge-address",
    success: true
  };
}

function failure<T>(code: string, message: string): H5BffResult<T> {
  return {
    code,
    message,
    recoverable: true,
    requestId: "bridge-address-location",
    success: false
  };
}

function normalizeAddress(address: BridgeAddress): AddressEntry {
  return {
    addr: normalizeText(address.addr),
    addrId: normalizeText(address.addrId),
    area: normalizeText(address.area),
    areaId: normalizeOptionalId(address.areaId),
    city: normalizeText(address.city),
    cityId: normalizeOptionalId(address.cityId),
    commonAddr: normalizeCommonAddress(address.commonAddr),
    lat: normalizeOptionalId(address.lat),
    lng: normalizeOptionalId(address.lng),
    mobile: normalizeText(address.mobile),
    province: normalizeText(address.province),
    provinceId: normalizeOptionalId(address.provinceId),
    receiver: normalizeText(address.receiver)
  };
}

function normalizeLocation(location: BridgeAddressLocation): AddressLocationResult {
  return {
    addr: normalizeText(location.addr),
    area: normalizeText(location.area),
    ...(location.areaId === undefined || location.areaId === null ? {} : { areaId: location.areaId }),
    city: normalizeText(location.city),
    ...(location.cityId === undefined || location.cityId === null ? {} : { cityId: location.cityId }),
    ...(location.lat === undefined || location.lat === null ? {} : { lat: location.lat }),
    ...(location.lng === undefined || location.lng === null ? {} : { lng: location.lng }),
    name: normalizeText(location.name),
    province: normalizeText(location.province),
    ...(location.provinceId === undefined || location.provinceId === null ? {} : { provinceId: location.provinceId })
  };
}

function normalizeText(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function normalizeCommonAddress(value: BridgeAddress["commonAddr"]): 0 | 1 {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

function normalizeOptionalId(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value as number | string;
}

function logAddressLocation(logger: Pick<Console, "info" | "warn">, level: "info" | "warn", detail: string) {
  logger[level](`[MeuMall][address-location] ${detail}`);
}
