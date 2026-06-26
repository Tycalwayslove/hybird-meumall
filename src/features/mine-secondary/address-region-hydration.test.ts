import { describe, expect, it } from "vitest";

import { hydrateAddressEditRegions } from "./address-region-hydration";
import type { AddressEntry } from "./mock/address-data";

const sampleAddress: AddressEntry = {
  addr: "东风中路268号",
  addrId: "3001",
  area: "越秀区",
  areaId: "440104",
  city: "广州市",
  cityId: "440100",
  commonAddr: 1,
  mobile: "1827267737",
  province: "广东省",
  provinceId: "440000",
  receiver: "秦先生"
};

describe("address region hydration", () => {
  it("loads province, city and district options before echoing an edited address", async () => {
    const calls: Array<string | undefined> = [];
    const result = await hydrateAddressEditRegions({
      address: sampleAddress,
      getAddressRegions: async (parentId) => {
        calls.push(parentId === undefined ? undefined : String(parentId));
        if (parentId === undefined) {
          return success([{ areaId: "440000", areaName: "广东省" }]);
        }
        if (String(parentId) === "440000") {
          return success([{ areaId: "440100", areaName: "广州市" }]);
        }
        if (String(parentId) === "440100") {
          return success([{ areaId: "440104", areaName: "越秀区" }]);
        }
        return success([]);
      }
    });

    expect(calls).toEqual([undefined, "440000", "440100"]);
    expect(result.fields).toEqual({
      area: "越秀区",
      areaId: "440104",
      city: "广州市",
      cityId: "440100",
      province: "广东省",
      provinceId: "440000"
    });
    expect(result.provinceOptions).toEqual([{ areaId: "440000", areaName: "广东省" }]);
    expect(result.cityOptions).toEqual([{ areaId: "440100", areaName: "广州市" }]);
    expect(result.areaOptions).toEqual([{ areaId: "440104", areaName: "越秀区" }]);
    expect(result.statusText).toBe("");
  });

  it("does not synthesize region options when the Java region API returns no match", async () => {
    const result = await hydrateAddressEditRegions({
      address: sampleAddress,
      getAddressRegions: async () => success([])
    });

    expect(result.fields).toEqual({
      area: "",
      areaId: "",
      city: "",
      cityId: "",
      province: "",
      provinceId: ""
    });
    expect(result.provinceOptions).toEqual([]);
    expect(result.cityOptions).toEqual([]);
    expect(result.areaOptions).toEqual([]);
    expect(result.statusText).toBe("省市区接口暂无数据，请稍后重试。");
  });
});

function success(regions: Array<{ areaId: string; areaName: string }>) {
  return {
    data: {
      modules: {
        regions
      },
      view: {
        regions
      }
    },
    requestId: "region-test",
    success: true as const
  };
}
