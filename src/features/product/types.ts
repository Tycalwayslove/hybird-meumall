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
  avatarUrl?: string;
  content: string;
  imageUrls?: string[];
  rating?: number;
  skuText?: string;
};

export type ProductMediaItem = {
  id: string;
  posterUrl?: string;
  type: "image" | "video";
  url: string;
};

export type ProductShopSummary = {
  href: string;
  id: string;
  logoUrl?: string;
  name: string;
  statusText: string;
};

export type ProductSkuOption = {
  id: string;
  imageUrl?: string;
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
  heroImageUrls?: string[];
  mediaItems?: ProductMediaItem[];
  services: ProductServiceItem[];
  selectionRows: ProductSelectionItem[];
  licenseTags: string[];
  shop?: ProductShopSummary;
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
    richContentHtml?: string;
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
  imageUrl?: string;
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
  productId: string;
  items: OrderConfirmItem[];
  totalQuantity: number;
  totalAmount: number;
  canSubmit: boolean;
  serviceRows: OrderConfirmFeeRow[];
  discountRows: OrderConfirmFeeRow[];
};
