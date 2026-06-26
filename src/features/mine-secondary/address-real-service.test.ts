import { describe, expect, it } from "vitest";

import type { BackendRequestOptions } from "@/server/http/backend-client";
import {
  deleteAddress,
  fetchAddressRegions,
  fetchAddressList,
  saveAddress,
  setDefaultAddress,
  type JavaAddressEnvelope
} from "./server/address-real-service";

const sampleAddress = {
  addr: "东风中路268号",
  addrId: 3001,
  area: "越秀区",
  city: "广州市",
  commonAddr: 1,
  mobile: "1827267737",
  province: "广东省",
  receiver: "秦先生"
};

describe("address real service", () => {
  it("loads Java area children for province, city and district selectors", async () => {
    const backendClient = createFakeBackendClient({
      "/p/area/listByPid?level=1": {
        code: "00000",
        data: [{ areaId: 440000, areaName: "广东省" }],
        success: true
      },
      "/p/area/listByPid?pid=440000": {
        code: "00000",
        data: [{ areaId: 440100, areaName: "广州市" }],
        success: true
      }
    });

    const provinces = await fetchAddressRegions({
      authToken: "token",
      backendClient,
      route: "/api/bff/address/regions"
    });
    const cities = await fetchAddressRegions({
      authToken: "token",
      backendClient,
      parentId: "440000",
      route: "/api/bff/address/regions"
    });

    expect(provinces.ok).toBe(true);
    if (provinces.ok) {
      expect(provinces.data.view.regions).toEqual([{ areaId: "440000", areaName: "广东省" }]);
    }
    expect(cities.ok).toBe(true);
    if (cities.ok) {
      expect(cities.data.view.regions).toEqual([{ areaId: "440100", areaName: "广州市" }]);
    }
    expect(backendClient.paths).toEqual(["GET /p/area/listByPid?level=1", "GET /p/area/listByPid?pid=440000"]);
  });

  it("loads the Java address list and maps it for H5 screens", async () => {
    const backendClient = createFakeBackendClient({
      "/p/address/list?isDefaultFirst=false": {
        code: "00000",
        data: [sampleAddress],
        success: true
      }
    });

    const result = await fetchAddressList({
      authToken: "token",
      backendClient,
      route: "/api/bff/address/list"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.addresses).toEqual([
        {
          addr: "东风中路268号",
          addrId: "3001",
          area: "越秀区",
          city: "广州市",
          commonAddr: 1,
          mobile: "1827267737",
          province: "广东省",
          receiver: "秦先生"
        }
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/address/list?isDefaultFirst=false"]);
  });

  it("saves new addresses, updates existing addresses and mutates default/delete endpoints", async () => {
    const backendClient = createFakeBackendClient({
      "/p/address/addAddr": {
        code: "00000",
        data: "保存成功",
        success: true
      },
      "/p/address/defaultAddr/3001": {
        code: "00000",
        data: "设置成功",
        success: true
      },
      "/p/address/deleteAddr/3001": {
        code: "00000",
        data: "删除成功",
        success: true
      },
      "/p/address/updateAddr": {
        code: "00000",
        data: "修改成功",
        success: true
      }
    });

    await saveAddress({
      address: sampleAddress,
      authToken: "token",
      backendClient,
      route: "/api/bff/address/save"
    });
    await saveAddress({
      address: { ...sampleAddress, addrId: "" },
      authToken: "token",
      backendClient,
      route: "/api/bff/address/save"
    });
    await setDefaultAddress({
      addrId: "3001",
      authToken: "token",
      backendClient,
      route: "/api/bff/address/default"
    });
    await deleteAddress({
      addrId: "3001",
      authToken: "token",
      backendClient,
      route: "/api/bff/address/delete"
    });

    expect(backendClient.paths).toEqual(["PUT /p/address/updateAddr", "POST /p/address/addAddr", "PUT /p/address/defaultAddr/3001", "DELETE /p/address/deleteAddr/3001"]);
  });
});

function createFakeBackendClient(responses: Record<string, JavaAddressEnvelope<unknown>>) {
  const paths: string[] = [];

  return {
    paths,
    async request<T>(options: BackendRequestOptions) {
      paths.push(`${options.method ?? "GET"} ${options.path}`);
      const response = responses[options.path];
      if (!response) {
        throw new Error(`Unexpected request: ${options.path}`);
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-address",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
