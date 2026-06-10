import type { ProductDetailData } from "../types";

export const mockProductDetails: ProductDetailData[] = [
  {
    id: "p-1001",
    title: "夏季纯棉短袖 T 恤男女同款宽松百搭休闲圆领上衣",
    subtitle: "定制鞋面，头层牛皮脚垫，A类橡胶底，舒适透气防滑耐磨",
    talentLevelLabel: "V3达人专享价",
    price: "2898",
    originalPrice: "3989",
    soldText: "已售 2300+",
    countdown: ["49", "32", "06"],
    galleryText: "3/6",
    services: [{ label: "7天无理由退货" }, { label: "假一罚十" }, { label: "售后私信协商" }, { label: "退货免运费" }],
    selectionRows: [
      {
        label: "选择",
        value: "已选：海参唤醒金装送人礼盒1盒(50ml*8)...",
        action: "purchase"
      },
      {
        label: "配送",
        value: "7天内发货  |  快递配送  |  免运费",
        accentPrefix: "7天内发货"
      },
      {
        label: "地址",
        value: "广东省 深圳市 南山区科兴科学园...",
        action: "address"
      }
    ],
    licenseTags: ["营业执照", "品牌授权"],
    reviewSummary: {
      countText: "评价：100+",
      positiveRateText: "好评率90%",
      tags: ["品质保证", "7天包赔", "品质保证", "细腻柔滑"],
      reviews: [
        {
          author: "谭***稳重",
          content: "这款笔记本很薄，重量稍微比我想象的要中一点点，不过还不很满意，散热挺好的，用很久都不会。"
        },
        {
          author: "谭***稳重",
          content: "这款笔记本很薄，重量稍微比我想象的要中一点点，不过还不很满意，散热挺好的，用起来很舒适。"
        }
      ]
    },
    detail: {
      title: "商品详情",
      description:
        "产品介绍文案这款笔记本很薄，重量稍微比我想象的要中一点点，不过还不很满意，散热挺好的，用很久都不",
      imageLabel: "商品详情图占位"
    },
    consultPlaceholder: "衣服质量如何？",
    consultHref: "/consult",
    buyHref: "/order-confirm",
    purchase: {
      imageLabel: "夏季纯棉短袖商品图",
      defaultSkuId: "shirt-m",
      defaultQuantity: 1,
      specsTitle: "夏季纯棉短袖T恤(2)",
      skus: [
        {
          id: "shirt-m",
          label: "夏季纯棉短袖T恤(m码)",
          selectedLabel: "夏季纯棉短袖 T 恤男女同款宽松百搭...",
          specsText: "黑色，M",
          price: 628,
          stock: 1000
        },
        {
          id: "shirt-relaxed-m",
          label: "夏季纯棉短袖T恤男女同款(m码)",
          selectedLabel: "夏季纯棉短袖 T 恤男女同款宽松百搭...",
          specsText: "黑色，L",
          price: 828,
          stock: 1000
        },
        {
          id: "shirt-relaxed-l",
          label: "夏季纯棉短袖T恤男女同款(m码)",
          selectedLabel: "夏季纯棉短袖 T 恤男女同款宽松百搭...",
          specsText: "黑色，XL",
          price: 928,
          stock: 1000
        }
      ],
      deliveryTitle: "配送方式",
      defaultDeliveryId: "express",
      deliveryOptions: [{ id: "express", label: "快递配送" }]
    }
  }
];
