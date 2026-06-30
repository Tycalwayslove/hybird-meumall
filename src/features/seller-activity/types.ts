export type SellerActivityStatus = 0 | 1;

export type SellerActivitySummary = {
  code?: string;
  description?: string;
  href: string;
  id: string;
  imageUrl?: string;
  orderCount: number;
  runningProductCount: number;
  status?: number;
  title: string;
};

export type SellerActivityProduct = {
  activityEndTime?: string;
  activityId: string;
  activityStartTime?: string;
  brief?: string;
  commissionText?: string;
  id?: string;
  imageUrl?: string;
  limitNum: number;
  originalPrice: number;
  price: number;
  prodId: string;
  skuList: SellerActivitySku[];
  soldNum: number;
  status?: number;
  title: string;
};

export type SellerActivitySku = {
  activityPrice?: number;
  commission?: number;
  costPrice?: number;
  id?: string;
  price?: number;
  skuId: string;
  skuName: string;
};

export type SellerAvailableProduct = {
  commissionAmount: number;
  href: string;
  imageUrl?: string;
  originalPrice: number;
  price: number;
  prodId: string;
  soldNum: number;
  title: string;
};

export type SellerActivityPage = {
  current: number;
  hasMore: boolean;
  pages?: number;
  size: number;
  total?: number;
};

export type SellerActivityMutationView = {
  message: string;
  ok: true;
};
