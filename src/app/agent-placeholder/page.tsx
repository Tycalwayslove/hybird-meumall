import { LowFiPage } from "@/components/commerce/LowFiPage";

export default function AgentPlaceholderPage() {
  return (
    <LowFiPage
      eyebrow="AGENT"
      title="智能体占位"
      description="智能体由 App 原生承载，H5 不实现具体业务。"
      blocks={[
        "智能体是原生一级 Tab 的业务范围，H5 仅保留占位说明页。",
        "创建、资料、对话、编辑等智能体具体能力不在当前 H5 页面实现。",
        "后续如需 H5 协作，必须先补充端归属和 Native/H5 契约。"
      ]}
      primaryHref="/mine"
      primaryLabel="返回我的"
    />
  );
}
