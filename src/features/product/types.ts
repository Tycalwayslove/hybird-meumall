export type ProductServiceItem = {
  label: string;
};

export type ProductSelectionItem = {
  label: string;
  value: string;
  href?: string;
  action?: "purchase" | "address";
  accentPrefix?: string;
};

export type ProductReview = {
  author: string;
  content: string;
};

export type ProductSkuOption = {
  id: string;
  label: string;
  selectedLabel: string;
  specsText: string;
  price: number;
  stock: number;
};

export type ProductDeliveryOption = {
  id: string;
  label: string;
};

export type ProductPurchaseData = {
  imageLabel: string;
  defaultSkuId: string;
  defaultQuantity: number;
  specsTitle: string;
  skus: ProductSkuOption[];
  deliveryTitle: string;
  defaultDeliveryId: string;
  deliveryOptions: ProductDeliveryOption[];
};

export type ProductDetailData = {
  id: string;
  title: string;
  subtitle: string;
  talentLevelLabel: string;
  price: string;
  originalPrice: string;
  soldText: string;
  countdown: [string, string, string];
  galleryText: string;
  services: ProductServiceItem[];
  selectionRows: ProductSelectionItem[];
  licenseTags: string[];
  reviewSummary: {
    countText: string;
    positiveRateText: string;
    tags: string[];
    reviews: ProductReview[];
  };
  detail: {
    title: string;
    description: string;
    imageLabel: string;
  };
  consultPlaceholder: string;
  consultHref: string;
  buyHref: string;
  purchase: ProductPurchaseData;
};

export type OrderConfirmAddress = {
  name: string;
  phone: string;
  fullAddress: string;
};

export type OrderConfirmItem = {
  id: string;
  imageLabel: string;
  title: string;
  specsText: string;
  price: number;
  quantity: number;
};

export type OrderConfirmFeeRow = {
  label: string;
  value: string;
  tone?: "muted" | "primary" | "price";
  navigable?: boolean;
};

export type OrderConfirmData = {
  address: OrderConfirmAddress | null;
  items: OrderConfirmItem[];
  totalQuantity: number;
  totalAmount: number;
  canSubmit: boolean;
  serviceRows: OrderConfirmFeeRow[];
  discountRows: OrderConfirmFeeRow[];
};
