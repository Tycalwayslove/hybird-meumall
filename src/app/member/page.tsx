import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const benefits = [
  { label: "推广佣金加成", helper: "等级影响佣金能力，具体比例待业务确认。", tone: "bg-emerald-500" },
  { label: "专属活动资格", helper: "可查看达人任务、奖励活动和权益解锁。", tone: "bg-amber-500" },
  { label: "购买权益", helper: "会员权益展示，不在此页发起支付流程。", tone: "bg-sky-500" }
];

export default function MemberPage() {
  return (
    <PageShell eyebrow="MEMBER" title="会员/达人中心" description="达人与会员是一套体系，登录后即具备达人身份。">
      <div className="space-y-6">
        <section className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">当前等级</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">V2 达人会员</h2>
              <p className="mt-2 text-sm leading-5 text-muted-fg">权益、佣金能力和成长任务统一展示。</p>
            </div>
            <IconBlock tone="bg-violet-500" size="lg" label="等级" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricCard label="成长值" value="1,280" helper="距离 V3 还差 720" />
            <MetricCard label="权益数量" value="6" helper="已解锁 4 项" />
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Benefits" title="权益骨架" />
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <article key={benefit.label} className="flex items-start gap-3 rounded-md border border-border p-4">
                <IconBlock tone={benefit.tone} size="lg" label={benefit.label} />
                <div>
                  <h3 className="text-sm font-semibold">{benefit.label}</h3>
                  <p className="mt-1 text-sm leading-5 text-muted-fg">{benefit.helper}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Link href="/mine" className="flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg">
          返回我的
        </Link>
      </div>
    </PageShell>
  );
}
