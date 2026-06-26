"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { StandardNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets/local-assets";
import { createWindowProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createH5Client } from "@/lib/http";

import { createAddressApi } from "../api";
import { createHybridAddressApi } from "../address-hybrid-api";
import { hydrateAddressEditRegions, type AddressRegionOption } from "../address-region-hydration";
import { formatAddressLine, type AddressEntry } from "../mock/address-data";
import styles from "./AddressScreens.module.css";

type AddressListScreenProps = {
  mode?: "manage" | "select";
  returnParams?: {
    productId?: string;
    quantity?: string;
    skuId?: string;
  };
  state?: "empty" | "normal";
};

const localAssetOptions = {
  basePath: process.env.NEXT_PUBLIC_H5_BASE_PATH || process.env.H5_BASE_PATH || "/hybird"
};

export function AddressListScreen({ mode = "manage", returnParams, state = "normal" }: AddressListScreenProps) {
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [statusText, setStatusText] = useState(state === "empty" ? "" : "正在同步地址...");
  const [isMutating, setIsMutating] = useState(false);
  const addressApi = useMemo(
    () =>
      createHybridAddressApi({
        bridge: createWindowProtocolBridge(),
        fallback: createAddressApi(createH5Client())
      }),
    []
  );
  const title = mode === "select" ? "选择收货地址" : "收货地址";

  useEffect(() => {
    if (state === "empty") {
      return;
    }

    let ignore = false;
    addressApi.getAddressList().then((result) => {
      if (ignore) {
        return;
      }
      if (result.success) {
        setAddresses(result.data.view.addresses);
        setStatusText(result.data.view.addresses.length > 0 ? "" : "暂无收货地址");
      } else {
        setAddresses([]);
        setStatusText(result.message || "地址接口暂不可用，请稍后重试。");
      }
    });

    return () => {
      ignore = true;
    };
  }, [addressApi, state]);

  const refreshAddresses = async () => {
    const result = await addressApi.getAddressList();
    if (result.success) {
      setAddresses(result.data.view.addresses);
      setStatusText(result.data.view.addresses.length > 0 ? "" : "暂无收货地址");
    } else {
      setAddresses([]);
      setStatusText(result.message);
    }
  };

  const handleSetDefault = async (addrId: string) => {
    setIsMutating(true);
    const result = await addressApi.setDefaultAddress(addrId);
    if (!result.success) {
      setStatusText(result.message);
    } else {
      setStatusText(result.data.view.message);
      await refreshAddresses();
    }
    setIsMutating(false);
  };

  const handleDelete = async (addrId: string) => {
    setIsMutating(true);
    const result = await addressApi.deleteAddress(addrId);
    if (!result.success) {
      setStatusText(result.message);
    } else {
      setStatusText(result.data.view.message);
      await refreshAddresses();
    }
    setIsMutating(false);
  };

  return (
    <StandardNavPage title={title} backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      {statusText ? <p className={styles.statusText}>{statusText}</p> : null}
      {addresses.length > 0 ? (
        <div className={styles.addressList}>
          {addresses.map((address) => (
            <AddressCard
              address={address}
              isMutating={isMutating}
              key={address.addrId}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              returnParams={returnParams}
              selectable={mode === "select"}
            />
          ))}
        </div>
      ) : (
        <AddressEmptyState />
      )}
      <div className={styles.footerButton}>
        <Link href="/address/edit">新增收货地址</Link>
      </div>
    </StandardNavPage>
  );
}

export function AddressEditScreen({ addrId, mode = "add" }: { addrId?: string; mode?: "add" | "edit" }) {
  const title = mode === "edit" ? "编辑收货地址" : "新增收货地址";
  const addressApi = useMemo(
    () =>
      createHybridAddressApi({
        bridge: createWindowProtocolBridge(),
        fallback: createAddressApi(createH5Client())
      }),
    []
  );
  const [form, setForm] = useState({
    addr: "",
    area: "",
    areaId: "",
    city: "",
    cityId: "",
    commonAddr: 0,
    lat: "",
    lng: "",
    mobile: "",
    province: "",
    provinceId: "",
    receiver: ""
  });
  const [statusText, setStatusText] = useState("");
  const [regionStatusText, setRegionStatusText] = useState("正在同步省市区数据...");
  const [provinceOptions, setProvinceOptions] = useState<AddressRegionOption[]>([]);
  const [cityOptions, setCityOptions] = useState<AddressRegionOption[]>([]);
  const [areaOptions, setAreaOptions] = useState<AddressRegionOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (addrId) {
      return;
    }

    let ignore = false;
    addressApi.getAddressRegions().then((result) => {
      if (ignore) {
        return;
      }
      if (result.success && result.data.view.regions.length > 0) {
        setProvinceOptions(result.data.view.regions);
        setRegionStatusText("");
      } else {
        setProvinceOptions([]);
        setRegionStatusText("省市区接口暂无数据，请稍后重试。");
      }
    });

    return () => {
      ignore = true;
    };
  }, [addrId, addressApi]);

  useEffect(() => {
    if (!addrId) {
      return;
    }

    let ignore = false;
    addressApi.getAddressInfo(addrId).then(async (result) => {
      if (ignore || !result.success || !result.data) {
        return;
      }
      const hydration = await hydrateAddressEditRegions({
        address: result.data,
        getAddressRegions: addressApi.getAddressRegions
      });
      if (ignore) {
        return;
      }

      setProvinceOptions(hydration.provinceOptions);
      setCityOptions(hydration.cityOptions);
      setAreaOptions(hydration.areaOptions);
      setRegionStatusText(hydration.statusText);
      setForm({
        addr: result.data.addr,
        area: hydration.fields.area,
        areaId: hydration.fields.areaId,
        city: hydration.fields.city,
        cityId: hydration.fields.cityId,
        commonAddr: result.data.commonAddr,
        lat: normalizeFormText(result.data.lat),
        lng: normalizeFormText(result.data.lng),
        mobile: result.data.mobile,
        province: hydration.fields.province,
        provinceId: hydration.fields.provinceId,
        receiver: result.data.receiver
      });
    });

    return () => {
      ignore = true;
    };
  }, [addrId, addressApi]);

  const updateForm = (key: keyof typeof form, value: string | number) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleProvinceChange = async (provinceName: string) => {
    const province = provinceOptions.find((item) => item.areaName === provinceName);
    updateFormFields({
      area: "",
      areaId: "",
      city: "",
      cityId: "",
      province: provinceName,
      provinceId: normalizeFormText(province?.areaId)
    });
    setAreaOptions([]);
    setCityOptions([]);

    if (!province?.areaId) {
      return;
    }

    const result = await addressApi.getAddressRegions(province.areaId);
    if (result.success && result.data.view.regions.length > 0) {
      setCityOptions(result.data.view.regions);
      setRegionStatusText("");
    } else {
      setCityOptions([]);
      setRegionStatusText("城市数据暂无数据，请稍后重试。");
    }
  };

  const handleCityChange = async (cityName: string) => {
    const city = cityOptions.find((item) => item.areaName === cityName);
    updateFormFields({
      area: "",
      areaId: "",
      city: cityName,
      cityId: normalizeFormText(city?.areaId)
    });

    if (!city?.areaId) {
      setAreaOptions([]);
      return;
    }

    const result = await addressApi.getAddressRegions(city.areaId);
    if (result.success && result.data.view.regions.length > 0) {
      setAreaOptions(result.data.view.regions);
      setRegionStatusText("");
    } else {
      setAreaOptions([]);
      setRegionStatusText("区县数据暂无数据，请稍后重试。");
    }
  };

  const handleAreaChange = (areaName: string) => {
    const area = areaOptions.find((item) => item.areaName === areaName);
    updateFormFields({
      area: areaName,
      areaId: normalizeFormText(area?.areaId)
    });
  };

  const updateFormFields = (fields: Partial<typeof form>) => {
    setForm((current) => ({
      ...current,
      ...fields
    }));
  };

  const handleLocationClick = async () => {
    setStatusText("正在请求 App 定位能力...");
    const result = await addressApi.chooseLocation();
    if (!result.success) {
      setStatusText(`${result.message} 请先手动选择省市区。`);
      return;
    }
    if (!result.data) {
      setStatusText("App 未返回定位结果，请先手动选择省市区。");
      return;
    }

    updateFormFields({
      addr: result.data.addr || result.data.name || form.addr,
      area: result.data.area ?? "",
      areaId: normalizeFormText(result.data.areaId),
      city: result.data.city ?? "",
      cityId: normalizeFormText(result.data.cityId),
      lat: normalizeFormText(result.data.lat),
      lng: normalizeFormText(result.data.lng),
      province: result.data.province ?? "",
      provinceId: normalizeFormText(result.data.provinceId)
    });
    setStatusText("已接收 App 定位返回，请确认省市区为接口返回选项。");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mobile = form.mobile.replace(/\s+/g, "");
    if (!form.receiver.trim() || !mobile || !form.province.trim() || !form.city.trim() || !form.area.trim() || !form.addr.trim()) {
      setStatusText("请完善收货人、手机号、地区和详细地址。");
      return;
    }
    if (!form.provinceId || !form.cityId || !form.areaId) {
      setStatusText("请从省市区列表中选择完整地区。");
      return;
    }
    if (!/^1\d{10}$/.test(mobile)) {
      setStatusText("请输入正确的手机号码。");
      return;
    }

    setIsSaving(true);
    const result = await addressApi.saveAddress({
      ...(addrId ? { addrId } : {}),
      addr: form.addr,
      area: form.area,
      areaId: form.areaId,
      city: form.city,
      cityId: form.cityId,
      commonAddr: form.commonAddr,
      lat: form.lat,
      lng: form.lng,
      mobile,
      province: form.province,
      provinceId: form.provinceId,
      receiver: form.receiver
    });
    setIsSaving(false);

    if (!result.success) {
      setStatusText(result.message);
      return;
    }

    setStatusText(result.data.view.message);
    navigateToAddressList();
  };

  return (
    <StandardNavPage title={title} backHref="/address" className={styles.screen} contentClassName={styles.content}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <FieldRow id="receiver" label="收货人">
          <input id="receiver" name="receiver" onChange={(event) => updateForm("receiver", event.target.value)} placeholder="请填写收货人姓名" value={form.receiver} />
        </FieldRow>
        <FieldRow id="mobile" label="手机号码">
          <input id="mobile" inputMode="tel" name="mobile" onChange={(event) => updateForm("mobile", event.target.value)} placeholder="请填写手机号码" value={form.mobile} />
        </FieldRow>
        <FieldRow id="area" label="所在地区">
          <div className={styles.areaGrid}>
            <select aria-label="省份" name="province" onChange={(event) => handleProvinceChange(event.target.value)} value={form.province}>
              <option value="">请选择省份</option>
              {provinceOptions.map((province) => (
                <option key={province.areaId} value={province.areaName}>
                  {province.areaName}
                </option>
              ))}
            </select>
            <select aria-label="城市" name="city" onChange={(event) => handleCityChange(event.target.value)} value={form.city}>
              <option value="">请选择城市</option>
              {cityOptions.map((city) => (
                <option key={city.areaId} value={city.areaName}>
                  {city.areaName}
                </option>
              ))}
            </select>
            <select aria-label="区县" name="area" onChange={(event) => handleAreaChange(event.target.value)} value={form.area}>
              <option value="">请选择区县</option>
              {areaOptions.map((area) => (
                <option key={area.areaId} value={area.areaName}>
                  {area.areaName}
                </option>
              ))}
            </select>
          </div>
          {regionStatusText ? <span className={styles.regionStatus}>{regionStatusText}</span> : null}
        </FieldRow>
        <FieldRow id="detail" label="详细地址">
          <textarea id="detail" name="addr" onChange={(event) => updateForm("addr", event.target.value)} placeholder="街道、楼牌号等详细地址" value={form.addr} />
          <button className={styles.locationAction} onClick={handleLocationClick} type="button">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={localAssetUrl("address.location", localAssetOptions)} alt="" />
            定位（Bridge 预留）
          </button>
        </FieldRow>
        <div className={styles.defaultRow}>
          <span>设为默认地址</span>
          <button
            aria-pressed={form.commonAddr === 1}
            className={`${styles.switchMock} ${form.commonAddr === 1 ? styles.switchMockActive : ""}`}
            onClick={() => updateForm("commonAddr", form.commonAddr === 1 ? 0 : 1)}
            type="button"
          />
        </div>
        {statusText ? <p className={styles.formStatus}>{statusText}</p> : null}
        <div className={styles.saveBar}>
          <button className={styles.saveButton} disabled={isSaving} type="submit">
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </StandardNavPage>
  );
}

function navigateToAddressList() {
  if (typeof window === "undefined") {
    return;
  }

  const basePath = localAssetOptions.basePath.replace(/\/+$/g, "");
  window.location.href = `${basePath}/address`;
}

function normalizeFormText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function AddressCard({
  address,
  isMutating,
  onDelete,
  onSetDefault,
  returnParams,
  selectable
}: {
  address: AddressEntry;
  isMutating: boolean;
  onDelete: (addrId: string) => void;
  onSetDefault: (addrId: string) => void;
  returnParams?: AddressListScreenProps["returnParams"];
  selectable: boolean;
}) {
  return (
    <article className={styles.addressCard}>
      <Link className={styles.addressMain} href={selectable ? createOrderConfirmHref(address.addrId, returnParams) : `/address/edit?addrId=${address.addrId}`}>
        <p className={styles.addressRegion}>{formatAddressLine(address)}</p>
        <p className={styles.addressDetail}>{address.addr}</p>
        <p className={styles.addressPerson}>
          <span>{address.receiver}</span>
          <span>{address.mobile}</span>
        </p>
        {selectable ? <span className={styles.useButton}>使用</span> : null}
      </Link>
      <div className={styles.addressActions}>
        <span className={styles.defaultFlag}>
          <button
            aria-label={address.commonAddr === 1 ? "默认地址" : "设为默认地址"}
            className={`${styles.defaultDot} ${address.commonAddr === 1 ? styles.defaultDotActive : ""}`}
            disabled={isMutating || address.commonAddr === 1}
            onClick={() => onSetDefault(address.addrId)}
            type="button"
          />
          {address.commonAddr === 1 ? "默认地址" : "设为默认地址"}
        </span>
        <span className={styles.actionButtons}>
          {address.commonAddr !== 1 ? (
            <button className={styles.textButton} disabled={isMutating} onClick={() => onDelete(address.addrId)} type="button">
              删除
            </button>
          ) : null}
          <Link className={styles.textButton} href={`/address/edit?addrId=${address.addrId}`}>
            编辑
          </Link>
        </span>
      </div>
    </article>
  );
}

function createOrderConfirmHref(addressId: string, returnParams?: AddressListScreenProps["returnParams"]) {
  const query = new URLSearchParams({
    addressId
  });

  if (returnParams?.productId) {
    query.set("productId", returnParams.productId);
  }
  if (returnParams?.skuId) {
    query.set("skuId", returnParams.skuId);
  }
  if (returnParams?.quantity) {
    query.set("quantity", returnParams.quantity);
  }

  return `/order-confirm?${query.toString()}`;
}

function AddressEmptyState() {
  return (
    <div className={styles.emptyState}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.emptyImage} src={localAssetUrl("address.empty", localAssetOptions)} alt="" />
      <span>暂无收货地址</span>
    </div>
  );
}

function FieldRow({ children, id, label }: { children: ReactNode; id: string; label: string }) {
  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.fieldControl}>{children}</div>
    </div>
  );
}
