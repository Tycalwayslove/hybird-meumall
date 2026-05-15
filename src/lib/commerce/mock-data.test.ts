import { describe, expect, test } from "vitest";
import {
  commerceCategories,
  commerceNavItems,
  featuredProducts,
  getProductById,
  mockCartItems
} from "./mock-data";

describe("commerce mock data", () => {
  test("provides stable navigation routes for the simulated commerce shell", () => {
    expect(commerceNavItems.map((item) => item.href)).toEqual(["/", "/category", "/cart", "/profile"]);
    expect(commerceNavItems.every((item) => item.iconTone.length > 0)).toBe(true);
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

  test("uses local cart mock items with positive quantities", () => {
    expect(mockCartItems.length).toBeGreaterThan(0);
    expect(mockCartItems.every((item) => item.quantity > 0)).toBe(true);
  });
});
