export type WalletRecord = {
  id: string;
  title: string;
  time: string;
  amount: string;
  type: "income" | "expense";
  avatarTone: "image" | "refund";
};

export type WalletSettlementTab = "settled" | "pending";

export type WalletSettlementView = {
  tab: WalletSettlementTab;
  summary: {
    income: string;
    expense: string;
    withdraw: string;
  };
  records: WalletRecord[];
};

export type CollectionProduct = {
  id: string;
  title: string;
  tag: string;
  price: string;
  originalPrice?: string;
  sales: string;
};

export type CouponItem = {
  id: string;
  amount: string;
  threshold: string;
  name: string;
  type: string;
  dateRange: string;
};

export type OrderStatus = "all" | "pending-payment" | "pending-shipment" | "pending-receipt" | "completed" | "empty";

export type OrderItem = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  tags?: string[];
};

export type MineOrder = {
  id: string;
  shopName: string;
  status: Exclude<OrderStatus, "all" | "empty">;
  statusLabel: string;
  items: OrderItem[];
  total?: string;
};

export const walletSummary = {
  balance: "2383.43",
  withdrawable: "47548",
  unsettled: "2383",
  income: "+3470",
  expense: "-2383",
  withdraw: "300"
} as const;

export const walletRecords: WalletRecord[] = [
  { id: "wr-1", title: "商品名称商品名称商品商...", time: "2025-09-25 17:05", amount: "+9874657", type: "income", avatarTone: "image" },
  { id: "wr-2", title: "商品名称", time: "2025-09-25 17:05", amount: "+4657", type: "income", avatarTone: "image" },
  { id: "wr-3", title: "退款-商品名称商品名...", time: "2025-09-25 17:05", amount: "-57", type: "expense", avatarTone: "refund" },
  { id: "wr-4", title: "商品名称商品名称商品...", time: "2025-09-25 17:05", amount: "+9874657", type: "income", avatarTone: "image" },
  { id: "wr-5", title: "商品名称商品名称商品...", time: "2025-09-25 17:05", amount: "+657", type: "income", avatarTone: "image" }
];

export const walletSettlementViews: Record<WalletSettlementTab, WalletSettlementView> = {
  settled: {
    tab: "settled",
    summary: {
      income: walletSummary.income,
      expense: walletSummary.expense,
      withdraw: walletSummary.withdraw
    },
    records: walletRecords
  },
  pending: {
    tab: "pending",
    summary: {
      income: "+1280",
      expense: "-168",
      withdraw: "0"
    },
    records: [
      { id: "wr-pending-1", title: "待结算-商品名称商品...", time: "2025-09-26 10:32", amount: "+628", type: "income", avatarTone: "image" },
      { id: "wr-pending-2", title: "待结算-商品推广奖励", time: "2025-09-26 09:18", amount: "+368", type: "income", avatarTone: "image" },
      { id: "wr-pending-3", title: "退款审核中-商品名称", time: "2025-09-25 21:05", amount: "-168", type: "expense", avatarTone: "refund" },
      { id: "wr-pending-4", title: "待结算-商品名称商品...", time: "2025-09-25 18:47", amount: "+284", type: "income", avatarTone: "image" }
    ]
  }
};

export const collectionProducts: CollectionProduct[] = Array.from({ length: 8 }, (_, index) => ({
  id: `saved-${index + 1}`,
  title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
  tag: "精选优质姜根提取物",
  price: "628",
  originalPrice: index % 3 === 1 ? undefined : "998",
  sales: "已售: 1w+"
}));

export const couponItems: CouponItem[] = [
  { id: "coupon-1", amount: "20", threshold: "无门槛", name: "优惠券名称", type: "商品券", dateRange: "2017.03.10-2017.12.30" },
  { id: "coupon-2", amount: "210", threshold: "满3000", name: "优惠券名称", type: "分类券", dateRange: "2017.03.10-2017.12.30" },
  { id: "coupon-3", amount: "210", threshold: "满3000", name: "优惠券名称", type: "通用券", dateRange: "2017.03.10-2017.12.30" }
];

const primaryOrderProduct = {
  id: "order-item-1",
  title: "夏季纯棉短袖 T 恤男女同款宽松百搭休闲圆领上衣 ins 潮牌打底衫",
  price: "628",
  originalPrice: "998",
  tags: ["7天无理由退货"]
};

export const mineOrders: MineOrder[] = [
  {
    id: "order-1",
    shopName: "某某某旗舰店",
    status: "pending-payment",
    statusLabel: "待付款",
    total: "1228",
    items: [
      primaryOrderProduct,
      {
        ...primaryOrderProduct,
        id: "order-item-2",
        tags: ["7天无理由退货", "售后私信协商", "退货免运费", "假一罚十", "其他"]
      }
    ]
  },
  {
    id: "order-2",
    shopName: "某某某旗舰店",
    status: "pending-shipment",
    statusLabel: "待发货",
    items: [{ ...primaryOrderProduct, id: "order-item-3" }]
  },
  {
    id: "order-3",
    shopName: "某某某旗舰店",
    status: "pending-receipt",
    statusLabel: "待收货",
    items: [{ ...primaryOrderProduct, id: "order-item-4" }]
  },
  {
    id: "order-4",
    shopName: "某某某旗舰店",
    status: "completed",
    statusLabel: "已完成",
    items: [{ ...primaryOrderProduct, id: "order-item-5" }]
  }
];

export const orderStatusTabs: Array<{ id: OrderStatus; title: string }> = [
  { id: "all", title: "全部" },
  { id: "pending-payment", title: "待付款" },
  { id: "pending-shipment", title: "待发货" },
  { id: "pending-receipt", title: "待收货" },
  { id: "completed", title: "已完成" }
];
