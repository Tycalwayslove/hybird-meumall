import type { HomeExperienceData } from "../home-page-data";

export const homeExperienceData = {
  logoAssetKey: "home.logo",
  messageAssetKey: "home.message",
  banner: {
    href: "/promotion",
    assetKey: "home.banner.springPlan",
    alt: "续航春P计划"
  },
  categories: [
    { label: "热门商品", href: "/category" },
    { label: "生鲜蔬菜", href: "/category" },
    { label: "零食饮料", href: "/category" },
    { label: "保健品", href: "/category" },
    { label: "洗护彩妆", href: "/category" },
    { label: "纸品家清", href: "/category" },
    { label: "母婴用品", href: "/category" },
    { label: "厨房家居", href: "/category" },
    { label: "家电3C", href: "/category" },
    { label: "更多分类", href: "/category" }
  ],
  activities: [
    {
      title: "限时秒杀",
      subtitle: "让实惠飞一会",
      href: "/seckill",
      backgroundAssetKey: "home.activity.seckillBg"
    },
    {
      title: "推广带货",
      subtitle: "佣金至高50%!",
      href: "/promotion",
      backgroundAssetKey: "home.activity.promotionBg"
    }
  ],
  recommendationIconAssetKey: "home.recommend.icon",
  moreAssetKey: "home.more",
  talentPriceTagAssetKey: "home.talentPriceTag",
  seckillLabelAssetKey: "home.activity.seckillLabel",
  products: [
    {
      id: "home-p-1",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "热卖",
      price: "368",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "talent"
    },
    {
      id: "home-p-2",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "推荐",
      price: "928",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "seckill"
    },
    {
      id: "home-p-3",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "热卖",
      price: "368",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "talent"
    },
    {
      id: "home-p-4",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "推荐",
      price: "928",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "seckill"
    },
    {
      id: "home-p-5",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "热卖",
      price: "368",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "talent"
    },
    {
      id: "home-p-6",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "推荐",
      price: "928",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "seckill"
    },
    {
      id: "home-p-7",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "热卖",
      price: "368",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "talent"
    },
    {
      id: "home-p-8",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "推荐",
      price: "928",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "seckill"
    },
    {
      id: "home-p-9",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "热卖",
      price: "368",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "talent"
    },
    {
      id: "home-p-10",
      title: "夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...",
      href: "/product/p-1001",
      badge: "推荐",
      price: "928",
      originalPrice: "998",
      soldText: "已售 2300",
      promoType: "seckill"
    }
  ]
} as const satisfies HomeExperienceData;
