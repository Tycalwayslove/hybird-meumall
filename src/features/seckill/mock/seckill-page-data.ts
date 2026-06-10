export type SeckillProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  soldText: string;
  stockText: string;
  countdown: string;
  limitText: string;
  progress: number;
  tone: "blue" | "gold" | "charcoal";
};

export const seckillProducts: SeckillProduct[] = [
  {
    id: "seckill-earbuds",
    title: "夏季纯棉短袖T恤男女同款宽松版",
    price: 6628,
    originalPrice: 9998,
    soldText: "已售: 1w+",
    stockText: "还剩: 100件",
    countdown: "20:30:12",
    limitText: "限购12件",
    progress: 50,
    tone: "blue"
  },
  {
    id: "seckill-lotion",
    title: "夏季纯棉短袖T恤男女同款宽松版",
    price: 6628,
    originalPrice: 9998,
    soldText: "已售: 1w+",
    stockText: "还剩: 100件",
    countdown: "20:30:12",
    limitText: "限购1件",
    progress: 38,
    tone: "gold"
  },
  {
    id: "seckill-shirt",
    title: "夏季纯棉短袖T恤男女同款宽松版",
    price: 6628,
    originalPrice: 9998,
    soldText: "已售: 1w+",
    stockText: "还剩: 100件",
    countdown: "20:30:12",
    limitText: "限购1件",
    progress: 42,
    tone: "charcoal"
  }
];
