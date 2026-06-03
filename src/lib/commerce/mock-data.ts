export type CommerceEntry = {
  label: string;
  href: string;
  tone: string;
  helper?: string;
};

export type MockProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  commission?: number;
  badge: string;
  category: string;
  imageTone: string;
  href: string;
  specs: string[];
};

export type CommerceCategory = {
  id: string;
  name: string;
  iconTone: string;
  products: MockProduct[];
};

export type MockOrder = {
  id: string;
  title: string;
  status: string;
  amount: number;
  helper: string;
};

export const primaryH5Entrances: CommerceEntry[] = [
  { label: "首页内容", href: "/", tone: "bg-primary", helper: "由原生首页 Tab 加载" },
  { label: "推广内容", href: "/promotion", tone: "bg-emerald-500", helper: "达人、收益和工具" },
  { label: "我的内容", href: "/mine", tone: "bg-rose-500", helper: "用户资产和记录" }
];

export const homeEntries: CommerceEntry[] = [
  { label: "分类", href: "/category", tone: "bg-emerald-500" },
  { label: "秒杀", href: "/seckill", tone: "bg-rose-500" },
  { label: "推广", href: "/promotion", tone: "bg-amber-500" },
  { label: "消息", href: "/messages", tone: "bg-sky-500" }
];

export const promotionEntries: CommerceEntry[] = [
  { label: "推广商品", href: "/promotion/products", tone: "bg-emerald-500", helper: "选择商品生成素材" },
  { label: "佣金收益", href: "/promotion/commission", tone: "bg-amber-500", helper: "N+1 查看结算结果" },
  { label: "我的名片", href: "/promotion/card", tone: "bg-sky-500", helper: "二维码和分享入口" },
  { label: "达人等级", href: "/promotion/level", tone: "bg-violet-500", helper: "V1-V5 权益骨架" }
];

export const mineEntries: CommerceEntry[] = [
  { label: "商品收藏", href: "/favorites/products", tone: "bg-rose-500" },
  { label: "店铺收藏", href: "/favorites/shops", tone: "bg-amber-500" },
  { label: "会员/达人", href: "/member", tone: "bg-violet-500" },
  { label: "购买记录", href: "/orders", tone: "bg-emerald-500" }
];

export const featuredProducts: MockProduct[] = [
  {
    id: "p-1001",
    name: "轻量通勤托特包",
    subtitle: "防泼水面料，13 寸电脑隔层",
    price: 269,
    originalPrice: 399,
    commission: 28,
    badge: "热卖",
    category: "bags",
    imageTone: "bg-sky-200",
    href: "/product/p-1001",
    specs: ["雾蓝", "米白", "黑色"]
  },
  {
    id: "p-1002",
    name: "云感基础针织衫",
    subtitle: "柔软亲肤，适合春夏叠穿",
    price: 159,
    originalPrice: 229,
    commission: 16,
    badge: "新品",
    category: "apparel",
    imageTone: "bg-emerald-200",
    href: "/product/p-1002",
    specs: ["S", "M", "L", "XL"]
  },
  {
    id: "p-1003",
    name: "智能保温随行杯",
    subtitle: "温度显示，6 小时保温",
    price: 129,
    commission: 12,
    badge: "精选",
    category: "home",
    imageTone: "bg-amber-200",
    href: "/product/p-1003",
    specs: ["420ml", "520ml"]
  },
  {
    id: "p-1004",
    name: "低糖坚果礼盒",
    subtitle: "每日独立小包装，办公室补给",
    price: 89,
    originalPrice: 119,
    commission: 9,
    badge: "限时",
    category: "food",
    imageTone: "bg-rose-200",
    href: "/product/p-1004",
    specs: ["15 袋", "30 袋"]
  },
  {
    id: "p-1005",
    name: "无线降噪耳机",
    subtitle: "通勤降噪，低延迟模式",
    price: 399,
    originalPrice: 599,
    commission: 42,
    badge: "补贴",
    category: "digital",
    imageTone: "bg-violet-200",
    href: "/product/p-1005",
    specs: ["白色", "深灰"]
  },
  {
    id: "p-1006",
    name: "舒眠香氛套装",
    subtitle: "木质调香，卧室和浴室适用",
    price: 199,
    commission: 18,
    badge: "口碑",
    category: "home",
    imageTone: "bg-teal-200",
    href: "/product/p-1006",
    specs: ["雪松", "晚香玉"]
  }
];

export const commerceCategories: CommerceCategory[] = [
  {
    id: "featured",
    name: "今日推荐",
    iconTone: "bg-primary",
    products: featuredProducts.slice(0, 4)
  },
  {
    id: "apparel",
    name: "服饰穿搭",
    iconTone: "bg-emerald-500",
    products: featuredProducts.filter((product) => product.category === "apparel" || product.category === "bags")
  },
  {
    id: "home",
    name: "家居生活",
    iconTone: "bg-amber-500",
    products: featuredProducts.filter((product) => product.category === "home")
  },
  {
    id: "digital",
    name: "数码配件",
    iconTone: "bg-violet-500",
    products: featuredProducts.filter((product) => product.category === "digital")
  },
  {
    id: "food",
    name: "食品生鲜",
    iconTone: "bg-rose-500",
    products: featuredProducts.filter((product) => product.category === "food")
  }
];

export const mockOrders: MockOrder[] = [
  { id: "o-240601-01", title: "轻量通勤托特包", status: "待支付", amount: 269, helper: "来自立即购买链路" },
  { id: "o-240531-09", title: "智能保温随行杯", status: "已完成", amount: 129, helper: "可作为购买记录弱摘要" },
  { id: "o-240530-18", title: "舒眠香氛套装", status: "售后待确认", amount: 199, helper: "售后规则后续确认" }
];

export function getProductById(id: string) {
  return featuredProducts.find((product) => product.id === id);
}
