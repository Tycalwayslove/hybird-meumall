import { describe, expect, test } from "vitest";
import {
  commerceCategories,
  featuredProducts,
  getProductById,
  homeEntries,
  mineEntries,
  mockOrders,
  primaryH5Entrances,
  promotionEntries
} from "./mock-data";

describe("commerce mock data", () => {
  test("provides H5 entrance routes without native tab rendering semantics", () => {
    expect(primaryH5Entrances.map((item) => item.href)).toEqual(["/", "/promotion", "/mine"]);
    expect(primaryH5Entrances.map((item) => item.label)).toEqual(["首页内容", "推广内容", "我的内容"]);
  });

  test("provides product cards that can resolve to detail pages", () => {
    expect(featuredProducts.length).toBeGreaterThanOrEqual(4);

    const firstProduct = featuredProducts[0];
    expect(getProductById(firstProduct.id)).toEqual(firstProduct);
    expect(firstProduct.href).toBe(`/product/${firstProduct.id}`);
  });

  test("groups products by category", () => {
    expect(commerceCategories.length).toBeGreaterThanOrEqual(4);
    expect(commerceCategories.every((category) => category.products.length > 0)).toBe(true);
  });

  test("provides first-level page action entries", () => {
    expect(homeEntries.map((item) => item.href)).toContain("/messages");
    expect(promotionEntries.map((item) => item.href)).toContain("/promotion/commission");
    expect(mineEntries.map((item) => item.href)).toContain("/orders");
  });

  test("uses local order mock items for purchase records", () => {
    expect(mockOrders.length).toBeGreaterThan(0);
    expect(mockOrders.every((item) => item.amount > 0)).toBe(true);
  });
});
