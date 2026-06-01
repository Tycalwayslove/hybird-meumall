import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const benefits = [
  { title: "专属佣金", state: "已解锁", tone: "bg-primary", helper: "按当前达人等级展示佣金能力。" },
  { title: "活动优先报名", state: "已解锁", tone: "bg-emerald-500", helper: "活动规则和名额后续由配置承接。" },
  { title: "专属素材包", state: "已解锁", tone: "bg-sky-500", helper: "用于推广图文、口令和名片入口。" },
  { title: "高阶榜单权益", state: "未解锁", tone: "bg-violet-500", helper: "升级到 V4 后展示更多榜单能力。" }
];

export default function PromotionBenefitsPage() {
  return (
    <PageShell eyebrow="BENEFITS" title="权益中心" description="展示当前等级权益和未解锁权益，保留后续规则入口。">
      <div className="space-y-6">
        <section className="rounded-md bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">当前身份</p>
          <h2 className="mt-1 text-xl font-semibold">V3 成长达人权益</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">达人和会员使用同一套成长体系，本页只做低保真内容骨架。</p>
        </section>

        <section>
          <SectionHeader eyebrow="Benefits" title="权益列表" />
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-md border border-border p-4">
                <div className="flex items-start gap-3">
                  <IconBlock tone={benefit.tone} size="lg" label={benefit.title} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-medium">{benefit.title}</h2>
                      <span className="shrink-0 text-xs text-muted-fg">{benefit.state}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-fg">{benefit.helper}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/promotion/level"
          className="flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
        >
          查看达人等级
        </Link>
      </div>
    </PageShell>
  );
}
