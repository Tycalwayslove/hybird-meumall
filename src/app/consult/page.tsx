import { LowFiPage } from "@/components/commerce/LowFiPage";

export default function ConsultPage() {
  return (
    <LowFiPage
      eyebrow="CONSULT"
      title="商品咨询"
      description="商品详情咨询入口占位，暂不实现具体会话能力。"
      blocks={["展示咨询入口已打通，后续确认咨询对象和承接端。", "可放置常见问题、服务承诺和人工入口状态。", "不在当前 H5 页面内实现实时 IM 协议。"]}
      primaryHref="/category"
      primaryLabel="继续浏览商品"
    />
  );
}
