import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import type {
  AddressListBffData,
  AddressMutationBffData,
  AddressRegionsBffData,
  AddressSaveBffData,
  JavaAddress
} from "./server/address-real-service";
import type { AddressEntry } from "./mock/address-data";

type AddressHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export function createAddressApi(client: AddressHttpClient) {
  return {
    deleteAddress(addrId: string) {
      return client.request<AddressMutationBffData>("/api/bff/address/delete", {
        body: { addrId },
        method: "DELETE"
      });
    },
    getAddressInfo(addrId: string) {
      return client.request<AddressEntry | null>("/api/bff/address/info?" + new URLSearchParams({ addrId }).toString());
    },
    getAddressList() {
      return client.request<AddressListBffData>("/api/bff/address/list");
    },
    getAddressRegions(parentId?: string | number) {
      const query = parentId === undefined || parentId === "" ? "" : "?" + new URLSearchParams({ parentId: String(parentId) }).toString();
      return client.request<AddressRegionsBffData>(`/api/bff/address/regions${query}`);
    },
    saveAddress(address: JavaAddress) {
      return client.request<AddressSaveBffData>("/api/bff/address/save", {
        body: address,
        method: address.addrId ? "PUT" : "POST"
      });
    },
    setDefaultAddress(addrId: string) {
      return client.request<AddressMutationBffData>("/api/bff/address/default", {
        body: { addrId },
        method: "PUT"
      });
    }
  };
}

export type AddressApi = ReturnType<typeof createAddressApi>;
