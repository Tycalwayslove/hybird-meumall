import type { H5BffResult } from "@/lib/http";

import type { AddressEntry } from "./mock/address-data";
import type { AddressRegionsBffData } from "./server/address-real-service";

export type AddressRegionOption = {
  areaId: number | string;
  areaName: string;
};

export type AddressRegionFields = {
  area: string;
  areaId: string;
  city: string;
  cityId: string;
  province: string;
  provinceId: string;
};

export type AddressEditRegionHydration = {
  areaOptions: AddressRegionOption[];
  cityOptions: AddressRegionOption[];
  fields: AddressRegionFields;
  provinceOptions: AddressRegionOption[];
  statusText: string;
};

export async function hydrateAddressEditRegions({
  address,
  getAddressRegions
}: {
  address: AddressEntry;
  getAddressRegions: (parentId?: string | number) => Promise<H5BffResult<AddressRegionsBffData>>;
}): Promise<AddressEditRegionHydration> {
  const empty = createEmptyHydration();
  const provinceResult = await getAddressRegions();
  if (!provinceResult.success || provinceResult.data.view.regions.length === 0) {
    return {
      ...empty,
      statusText: "省市区接口暂无数据，请稍后重试。"
    };
  }

  const provinceOptions = provinceResult.data.view.regions;
  const province = findRegion(provinceOptions, address.provinceId, address.province);
  if (!province) {
    return {
      ...empty,
      provinceOptions,
      statusText: "省市区接口未匹配当前地址，请重新选择。"
    };
  }

  const cityResult = await getAddressRegions(province.areaId);
  const cityOptions = cityResult.success ? cityResult.data.view.regions : [];
  const city = findRegion(cityOptions, address.cityId, address.city);
  if (!city) {
    return {
      ...empty,
      fields: {
        ...empty.fields,
        province: province.areaName,
        provinceId: normalizeText(province.areaId)
      },
      provinceOptions,
      statusText: cityOptions.length > 0 ? "省市区接口未匹配当前地址，请重新选择。" : "城市数据暂无数据，请稍后重试。"
    };
  }

  const areaResult = await getAddressRegions(city.areaId);
  const areaOptions = areaResult.success ? areaResult.data.view.regions : [];
  const area = findRegion(areaOptions, address.areaId, address.area);
  if (!area) {
    return {
      ...empty,
      cityOptions,
      fields: {
        ...empty.fields,
        city: city.areaName,
        cityId: normalizeText(city.areaId),
        province: province.areaName,
        provinceId: normalizeText(province.areaId)
      },
      provinceOptions,
      statusText: areaOptions.length > 0 ? "省市区接口未匹配当前地址，请重新选择。" : "区县数据暂无数据，请稍后重试。"
    };
  }

  return {
    areaOptions,
    cityOptions,
    fields: {
      area: area.areaName,
      areaId: normalizeText(area.areaId),
      city: city.areaName,
      cityId: normalizeText(city.areaId),
      province: province.areaName,
      provinceId: normalizeText(province.areaId)
    },
    provinceOptions,
    statusText: ""
  };
}

function createEmptyHydration(): AddressEditRegionHydration {
  return {
    areaOptions: [],
    cityOptions: [],
    fields: {
      area: "",
      areaId: "",
      city: "",
      cityId: "",
      province: "",
      provinceId: ""
    },
    provinceOptions: [],
    statusText: ""
  };
}

function findRegion(options: AddressRegionOption[], id: unknown, name: unknown) {
  const normalizedId = normalizeText(id);
  const normalizedName = normalizeText(name);
  return options.find((option) => normalizeText(option.areaId) === normalizedId) ?? options.find((option) => option.areaName === normalizedName);
}

function normalizeText(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}
