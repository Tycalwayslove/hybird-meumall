export type PromotionProductOrderField = "soldNum" | "price" | "commission" | "commissionRatio";
export type PromotionProductOrderDirection = "asc" | "desc";

export type PromotionProductQueryValue = {
  categoryId?: string;
  keyword: string;
  orderBy: string;
};

export const DEFAULT_PROMOTION_PRODUCT_ORDER_BY = "-soldNum";

export const PROMOTION_PRODUCT_ORDER_FIELDS: Array<{
  defaultDirection: PromotionProductOrderDirection;
  field: PromotionProductOrderField;
  label: string;
}> = [
  { defaultDirection: "desc", field: "soldNum", label: "销量" },
  { defaultDirection: "asc", field: "price", label: "价格" },
  { defaultDirection: "desc", field: "commission", label: "佣金" },
  { defaultDirection: "desc", field: "commissionRatio", label: "佣金比率" }
];

export function buildPromotionProductOrderBy(field: PromotionProductOrderField, direction: PromotionProductOrderDirection) {
  return `${direction === "asc" ? "+" : "-"}${field}`;
}

export function parsePromotionProductOrderBy(orderBy: string | undefined): {
  direction: PromotionProductOrderDirection;
  field: PromotionProductOrderField;
} {
  const value = orderBy?.trim() || DEFAULT_PROMOTION_PRODUCT_ORDER_BY;
  const direction = value.startsWith("+") ? "asc" : "desc";
  const fieldText = value.replace(/^[+-]/, "");
  const matchedField = PROMOTION_PRODUCT_ORDER_FIELDS.find((item) => item.field === fieldText)?.field ?? "soldNum";

  return {
    direction,
    field: matchedField
  };
}

export function getNextPromotionProductOrderBy(currentOrderBy: string, field: PromotionProductOrderField) {
  const current = parsePromotionProductOrderBy(currentOrderBy);
  if (current.field === field) {
    return buildPromotionProductOrderBy(field, current.direction === "asc" ? "desc" : "asc");
  }

  const config = PROMOTION_PRODUCT_ORDER_FIELDS.find((item) => item.field === field);
  return buildPromotionProductOrderBy(field, config?.defaultDirection ?? "desc");
}
