import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const levels = ["V1", "V2", "V3", "V4", "V5"];

export default function PromotionLevelPage() {
  return (
    <PageShell eyebrow="LEVEL" title="达人等级" description="达人和会员为同一套体系，展示 V1-V5 成长骨架。">
      <div className="space-y-6">
        <section className="rounded-md bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">当前等级</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">V3 成长达人</h2>
              <p className="mt-2 text-sm leading-6 text-muted-fg">等级影响权益展示和佣金能力，具体比例后续接入规则。</p>
            </div>
            <IconBlock tone="bg-violet-500" size="lg" label="等级" className="size-14" />
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Progress" title="等级进度" />
          <div className="grid grid-cols-5 gap-2">
            {levels.map((level, index) => (
              <div
                key={level}
                className={`rounded-md border p-3 text-center text-sm font-medium ${
                  index <= 2 ? "border-primary bg-primary text-primary-fg" : "border-border text-muted-fg"
                }`}
              >
                {level}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard label="本月成交" value="36 单" helper="用于成长值占位" tone="bg-muted" />
          <MetricCard label="成长值" value="720/1000" helper="距 V4 还差 280" tone="bg-muted" />
        </section>

        <section>
          <SectionHeader eyebrow="Routes" title="相关入口" />
          <div className="grid grid-cols-2 gap-3">
            <Link href="/promotion/benefits" className="rounded-md border border-border p-4">
              <IconBlock tone="bg-emerald-500" size="lg" label="权益" />
              <h2 className="mt-3 text-sm font-medium">权益中心</h2>
              <p className="mt-1 text-xs leading-5 text-muted-fg">查看当前和未解锁权益。</p>
            </Link>
            <Link href="/promotion/ranking" className="rounded-md border border-border p-4">
              <IconBlock tone="bg-rose-500" size="lg" label="排行" />
              <h2 className="mt-3 text-sm font-medium">达人排行</h2>
              <p className="mt-1 text-xs leading-5 text-muted-fg">查看榜单骨架和刷新口径。</p>
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
