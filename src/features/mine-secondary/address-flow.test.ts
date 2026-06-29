import { describe, expect, it } from "vitest";

import {
  consumeAddressFlowResult,
  createAddressEditHref,
  createAddressListHref,
  createAddressReturnHref,
  parseAddressFlowContext,
  writeAddressFlowResult
} from "./address-flow";

describe("address flow helpers", () => {
  it("builds a selectable address list URL for the order confirmation flow", () => {
    const href = createAddressListHref({
      addressId: "3001",
      flowId: "order-1000054-6001-2",
      from: "order-confirm",
      mode: "select",
      productId: "1000054",
      quantity: "2",
      skuId: "6001"
    });

    expect(href).toBe(
      "/address?select=1&from=order-confirm&flowId=order-1000054-6001-2&productId=1000054&skuId=6001&quantity=2&addressId=3001"
    );
  });

  it("preserves address selection context when entering the edit page", () => {
    const context = parseAddressFlowContext({
      addressId: "3001",
      flowId: "order-1000054-6001-2",
      from: "order-confirm",
      productId: "1000054",
      quantity: "2",
      select: "1",
      skuId: "6001"
    });

    expect(createAddressEditHref(context, "3001")).toBe(
      "/address/edit?select=1&from=order-confirm&flowId=order-1000054-6001-2&productId=1000054&skuId=6001&quantity=2&addressId=3001&addrId=3001"
    );
  });

  it("returns to the originating business page with a selected address fallback href", () => {
    const orderContext = parseAddressFlowContext({
      flowId: "order-1000054-6001-2",
      from: "order-confirm",
      productId: "1000054",
      quantity: "2",
      select: "1",
      skuId: "6001"
    });
    const productContext = parseAddressFlowContext({
      flowId: "product-1000054",
      from: "product-detail",
      productId: "1000054",
      select: "1"
    });

    expect(createAddressReturnHref(orderContext, "3001")).toBe(
      "/order-confirm?productId=1000054&skuId=6001&quantity=2&addressId=3001"
    );
    expect(createAddressReturnHref(productContext, "3001")).toBe("/product/1000054?addressId=3001");
  });

  it("stores address flow results as one-shot session values", () => {
    const storage = createMemoryStorage();

    writeAddressFlowResult({ addressId: "3001", flowId: "order-1000054-6001-2", type: "select" }, storage);

    expect(consumeAddressFlowResult("order-1000054-6001-2", storage)).toEqual({
      addressId: "3001",
      flowId: "order-1000054-6001-2",
      type: "select"
    });
    expect(consumeAddressFlowResult("order-1000054-6001-2", storage)).toBeNull();
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    get length() {
      return values.size;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}
