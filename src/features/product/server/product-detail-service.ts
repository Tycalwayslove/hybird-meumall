import { mockProductDetails } from "../mock/product-detail";

export function getProductDetailById(id: string) {
  return mockProductDetails.find((product) => product.id === id) ?? null;
}
