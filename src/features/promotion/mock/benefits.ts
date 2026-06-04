import type { PromotionBenefitsData, TalentLevel } from "../types";
import { talentLevels } from "./home";

const sharedMemberBenefits = [
  {
    id: "agent-custom",
    title: "个性化智能体定制服务",
    description: "描述文案描述内容",
    iconKey: "benefit-agent"
  },
  {
    id: "mini-mall-tool",
    title: "小程序商城工具",
    description: "描述文案描述内容",
    iconKey: "benefit-box"
  },
  {
    id: "private-training",
    title: "私域营销培训资料",
    description: "描述文案描述内容",
    iconKey: "benefit-bag"
  },
  {
    id: "ai-tools",
    title: "各类AI工具",
    description: "描述文案描述内容",
    iconKey: "benefit-ai"
  }
];

export function buildPromotionBenefits(level: TalentLevel): PromotionBenefitsData {
  const levelMeta = talentLevels[level];
  const title = `V${level.slice(1)}${levelMeta.levelName}`;

  return {
    profile: {
      nickname: "深圳喵小猫",
      avatar: null,
      level,
      levelName: levelMeta.levelName,
      progress: {
        current: levelMeta.progress,
        target: 500,
        unit: "growth",
        nextTip: "本月再完成10单即可升级",
        unlockText: levelMeta.unlockText
      }
    },
    theme: levelMeta.theme,
    commission: {
      label: levelMeta.commissionLabel,
      description: `${title}佣金分成`
    },
    persona: levelMeta.persona,
    exclusiveBenefits: [
      {
        id: "commission-boost",
        title: level === "v1" ? "基础佣金" : "佣金膨胀20%",
        description: `${title}专享佣金比例`,
        iconKey: "benefit-money"
      },
      {
        id: "shopping-discount",
        title: "专属购物折扣",
        description: `${title}专享购物优惠`,
        iconKey: "benefit-discount"
      },
      {
        id: "birthday-gift",
        title: "生日专属礼",
        description: "生日当月可领取生日专属礼包(价值50元)",
        iconKey: "benefit-cake"
      },
      {
        id: "monthly-coupon",
        title: "每月50元无门槛优惠券",
        description: "描述文案描述内容",
        iconKey: "benefit-coupon"
      },
      {
        id: "exclusive-activities",
        title: "各类专属优惠活动",
        description: `各类${title}专享优惠活动`,
        iconKey: "benefit-gift"
      }
    ],
    memberBenefits: sharedMemberBenefits
  };
}
