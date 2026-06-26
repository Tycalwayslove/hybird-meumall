import { describe, expect, it } from "vitest";

import { BridgeRPCError, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import type { H5BffResult } from "@/lib/http";

import { createHybridAddressApi } from "./address-hybrid-api";
import type { AddressEntry } from "./mock/address-data";
import type { AddressApi } from "./api";

const sampleAddress: AddressEntry = {
  addr: "东风中路268号",
  addrId: "3001",
  area: "越秀区",
  city: "广州市",
  commonAddr: 1,
  mobile: "1827267737",
  province: "广东省",
  receiver: "秦先生"
};

describe("hybrid address api", () => {
  it("uses App Bridge before H5 BFF for address list and save mutations", async () => {
    const bridgeCalls: Array<{ action: string; payload: unknown }> = [];
    const fallbackCalls: string[] = [];
    const api = createHybridAddressApi({
      bridge: createFakeBridge({
        isAvailable: true,
        rpc: (async (action: string, ...args: unknown[]) => {
          const payload = args[0];
          bridgeCalls.push({ action, payload });
          if (action === "address.getList") {
            return { addresses: [sampleAddress] };
          }
          if (action === "address.save") {
            return { addrId: "3001", message: "保存成功" };
          }
          throw new Error(`Unexpected bridge action: ${action}`);
        }) as ProtocolBridge["rpc"]
      }),
      fallback: createFakeFallback(fallbackCalls)
    });

    await expect(api.getAddressList()).resolves.toMatchObject({
      data: { view: { addresses: [sampleAddress] } },
      success: true
    });
    await expect(api.saveAddress(sampleAddress)).resolves.toMatchObject({
      data: { view: { addrId: "3001", message: "保存成功", status: "saved" } },
      success: true
    });
    expect(bridgeCalls).toEqual([
      { action: "address.getList", payload: undefined },
      { action: "address.save", payload: sampleAddress }
    ]);
    expect(fallbackCalls).toEqual([]);
  });

  it("falls back to H5 BFF when App Bridge is unavailable or rejects an address action", async () => {
    const fallbackCalls: string[] = [];
    const unavailableApi = createHybridAddressApi({
      bridge: createFakeBridge({ isAvailable: false }),
      fallback: createFakeFallback(fallbackCalls)
    });

    await expect(unavailableApi.getAddressList()).resolves.toMatchObject({
      data: { view: { addresses: [sampleAddress] } },
      success: true
    });

    const rejectedApi = createHybridAddressApi({
      bridge: createFakeBridge({
        isAvailable: true,
        rpc: (async () => {
          throw new BridgeRPCError("unsupported", "address bridge is unsupported");
        }) as ProtocolBridge["rpc"]
      }),
      fallback: createFakeFallback(fallbackCalls)
    });

    await expect(rejectedApi.deleteAddress("3001")).resolves.toMatchObject({
      data: { view: { message: "地址已删除。", status: "ok" } },
      success: true
    });
    expect(fallbackCalls).toEqual(["getAddressList", "deleteAddress:3001"]);
  });

  it("reserves App Bridge location picking with local debug logs", async () => {
    const bridgeCalls: Array<{ action: string; payload: unknown }> = [];
    const debugLogs: string[] = [];
    const api = createHybridAddressApi({
      bridge: createFakeBridge({
        isAvailable: true,
        rpc: (async (action: string, ...args: unknown[]) => {
          bridgeCalls.push({ action, payload: args[0] });
          if (action === "address.chooseLocation") {
            return {
              location: {
                addr: "东风中路268号",
                area: "越秀区",
                city: "广州市",
                lat: 23.1291,
                lng: 113.2644,
                name: "交易广场",
                province: "广东省"
              }
            };
          }
          throw new Error(`Unexpected bridge action: ${action}`);
        }) as ProtocolBridge["rpc"]
      }),
      fallback: createFakeFallback([]),
      logger: {
        info(message) {
          debugLogs.push(message);
        },
        warn(message) {
          debugLogs.push(message);
        }
      }
    });

    await expect(api.chooseLocation()).resolves.toMatchObject({
      data: {
        addr: "东风中路268号",
        area: "越秀区",
        city: "广州市",
        name: "交易广场",
        province: "广东省"
      },
      success: true
    });
    expect(bridgeCalls).toEqual([{ action: "address.chooseLocation", payload: undefined }]);
    expect(debugLogs).toEqual(["[MeuMall][address-location] request address.chooseLocation", "[MeuMall][address-location] address.chooseLocation resolved"]);
  });
});

function createFakeBridge({
  isAvailable,
  rpc
}: {
  isAvailable: boolean;
  rpc?: ProtocolBridge["rpc"];
}): ProtocolBridge {
  return {
    emit() {},
    isAvailable() {
      return isAvailable;
    },
    navigate() {},
    on() {
      return () => {};
    },
    reply: {
      emit() {},
      reject() {},
      resolve() {}
    },
    rpc: rpc ?? (async () => undefined as never)
  };
}

function createFakeFallback(calls: string[]): AddressApi {
  const success = <T,>(data: T): H5BffResult<T> => ({
    data,
    requestId: "req-address-fallback",
    success: true
  });

  return {
    deleteAddress(addrId) {
      calls.push(`deleteAddress:${addrId}`);
      return Promise.resolve(success({ view: { message: "地址已删除。", status: "ok" } }));
    },
    getAddressInfo(addrId) {
      calls.push(`getAddressInfo:${addrId}`);
      return Promise.resolve(success(sampleAddress));
    },
    getAddressList() {
      calls.push("getAddressList");
      return Promise.resolve(success({ modules: { addressList: [] }, view: { addresses: [sampleAddress] } }));
    },
    getAddressRegions(parentId) {
      calls.push(`getAddressRegions:${parentId ?? ""}`);
      return Promise.resolve(success({ modules: { regions: [] }, view: { regions: [] } }));
    },
    saveAddress(address) {
      calls.push(`saveAddress:${address.addrId ?? ""}`);
      return Promise.resolve(success({ modules: { raw: null }, view: { addrId: "3001", message: "保存成功", status: "saved" } }));
    },
    setDefaultAddress(addrId) {
      calls.push(`setDefaultAddress:${addrId}`);
      return Promise.resolve(success({ view: { message: "默认地址已更新。", status: "ok" } }));
    }
  };
}
