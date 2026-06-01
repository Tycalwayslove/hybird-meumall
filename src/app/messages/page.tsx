import { LowFiPage } from "@/components/commerce/LowFiPage";

export default function MessagesPage() {
  return (
    <LowFiPage
      eyebrow="MESSAGES"
      title="消息中心"
      description="首页消息入口的低保真内容页。"
      blocks={["交易、活动和系统通知后续统一接入。", "当前只展示 H5 消息入口骨架，不接原生 IM。", "未读数、分类和消息详情待产品规则确认。"]}
    />
  );
}
