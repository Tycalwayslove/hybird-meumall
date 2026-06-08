import type { MinePageData } from "../types";

export const minePageData = {
  profile: {
    nickname: "深圳喵小猫",
    phone: "150****7196",
    levelCode: "V3",
    levelLabel: "黄金达人",
    membershipValidUntil: "2027-06-25"
  },
  heroBackgroundAssetKey: "mine.hero.background",
  heroRoleAssetKey: "mine.hero.role",
  notificationHref: "/messages",
  notificationAssetKey: "mine.notification",
  benefitsHref: "/promotion/benefits?level=v3",
  ordersHref: "/orders",
  metrics: [
    { label: "钱包余额", prefix: "¥", value: "678" },
    { label: "今年已省", prefix: "¥", value: "2383" },
    { label: "优惠券", value: "8" }
  ],
  orders: [
    { label: "待付款", href: "/orders?status=pending-payment", assetKey: "mine.order.pendingPayment" },
    { label: "待发货", href: "/orders?status=pending-shipment", assetKey: "mine.order.pendingShipment" },
    { label: "待收货", href: "/orders?status=pending-receipt", assetKey: "mine.order.pendingReceipt" },
    { label: "已完成", href: "/orders?status=completed", assetKey: "mine.order.completed" },
    { label: "退货退款", href: "/orders?status=refund", assetKey: "mine.order.refund" }
  ],
  banner: {
    href: "/member",
    assetKey: "mine.banner.springPlan",
    alt: "续航春P计划"
  },
  tools: [
    { label: "我的足迹", href: "/mine", assetKey: "mine.tool.footprint" },
    { label: "我的收藏", href: "/favorites/products", assetKey: "mine.tool.favorites" },
    { label: "地址管理", href: "/mine", assetKey: "mine.tool.address" },
    { label: "设置", href: "/mine", assetKey: "mine.tool.settings" },
    { label: "客服服务", href: "/consult", assetKey: "mine.tool.customerService" },
    { label: "帮助中心", href: "/mine", assetKey: "mine.tool.helpCenter" },
    { label: "消息中心", href: "/messages", assetKey: "mine.tool.messageCenter" },
    { label: "商品服务", href: "/orders", assetKey: "mine.tool.productService" }
  ]
} as const satisfies MinePageData;
