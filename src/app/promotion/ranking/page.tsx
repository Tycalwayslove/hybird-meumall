import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const rankingRows = [
  { name: "达人 A", rank: "01", value: "¥8,920", tone: "bg-primary" },
  { name: "达人 B", rank: "02", value: "¥7,460", tone: "bg-emerald-500" },
  { name: "达人 C", rank: "03", value: "¥6,180", tone: "bg-amber-500" },
  { name: "我", rank: "18", value: "¥1,286", tone: "bg-sky-500" }
];

export default function PromotionRankingPage() {
  return (
    <PageShell eyebrow="RANKING" title="达人排行" description="榜单低保真骨架，真实维度、脱敏和刷新频率后续确认。">
      <div className="space-y-6">
        <section className="rounded-md bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">本周榜单</p>
          <h2 className="mt-1 text-xl font-semibold">按结算收益展示</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">榜单金额为模拟数据，真实页面需要按隐私策略脱敏展示。</p>
        </section>

        <section>
          <SectionHeader eyebrow="List" title="排行榜" />
          <div className="divide-y divide-border rounded-md border border-border">
            {rankingRows.map((row) => (
              <div key={`${row.rank}-${row.name}`} className="flex min-h-16 items-center gap-3 px-4">
                <span className="w-7 text-sm font-semibold text-muted-fg">{row.rank}</span>
                <IconBlock tone={row.tone} size="lg" label={row.name} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-medium">{row.name}</h2>
                  <p className="mt-1 text-xs text-muted-fg">结算收益占位</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border p-4">
          <h2 className="text-sm font-medium">刷新口径占位</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">榜单可短缓存；个人敏感字段、收益维度和刷新频率需要后续产品确认。</p>
        </section>

        <Link
          href="/promotion/level"
          className="flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
        >
          返回达人等级
        </Link>
      </div>
    </PageShell>
  );
}
