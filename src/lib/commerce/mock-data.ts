export type CommerceNavItem = {
  label: string;
  href: string;
  iconTone: string;
};

export type MockProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
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

export type MockCartItem = {
  productId: string;
  quantity: number;
};

export const commerceNavItems: CommerceNavItem[] = [
  { label: "首页", href: "/", iconTone: "bg-primary" },
  { label: "分类", href: "/category", iconTone: "bg-emerald-500" },
  { label: "购物车", href: "/cart", iconTone: "bg-amber-500" },
  { label: "我的", href: "/profile", iconTone: "bg-rose-500" }
];

export const featuredProducts: MockProduct[] = [
  {
    id: "p-1001",
    name: "轻量通勤托特包",
    subtitle: "防泼水面料，13 寸电脑隔层",
    price: 269,
    originalPrice: 399,
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

export const mockCartItems: MockCartItem[] = [
  { productId: "p-1001", quantity: 1 },
  { productId: "p-1003", quantity: 2 },
  { productId: "p-1004", quantity: 1 }
];

export function getProductById(id: string) {
  return featuredProducts.find((product) => product.id === id);
}

export function getCartLines() {
  return mockCartItems
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { ...item, product, subtotal: product.price * item.quantity } : undefined;
    })
    .filter((item): item is MockCartItem & { product: MockProduct; subtotal: number } => Boolean(item));
}
