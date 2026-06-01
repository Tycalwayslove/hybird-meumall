import Link from "next/link";
import { ActionGrid } from "@/components/commerce/ActionGrid";
import { IconBlock } from "@/components/commerce/IconBlock";
import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { featuredProducts, promotionEntries } from "@/lib/commerce/mock-data";

const toolEntries = [
  { label: "推广素材", href: "/promotion/products", tone: "bg-emerald-500", helper: "商品图文和口令" },
  { label: "我的名片", href: "/promotion/card", tone: "bg-sky-500", helper: "二维码分享入口" },
  { label: "权益中心", href: "/promotion/benefits", tone: "bg-violet-500", helper: "等级权益和任务" },
  { label: "达人排行", href: "/promotion/ranking", tone: "bg-rose-500", helper: "榜单低保真骨架" }
];

const activityEntries = [
  { label: "本周活动", href: "/promotion/products", tone: "bg-amber-500" },
  { label: "高佣商品", href: "/promotion/products", tone: "bg-emerald-500" },
  { label: "佣金中心", href: "/promotion/commission", tone: "bg-primary" },
  { label: "等级成长", href: "/promotion/level", tone: "bg-violet-500" }
];

export default function PromotionPage() {
  return (
    <PageShell eyebrow="PROMOTION" title="推广中心" description="达人信息、收益概览和推广工具内容页。">
      <div className="space-y-6">
        <section className="rounded-md bg-muted p-4">
          <div className="flex items-center gap-3">
            <PlaceholderMedia ratio="avatar" tone="bg-primary" label="达人" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-fg">已登录达人</p>
              <h2 className="mt-1 truncate text-xl font-semibold">喵呜体验官</h2>
              <p className="mt-1 text-sm leading-5 text-muted-fg">V3 成长达人 · 当前展示本地模拟数据</p>
            </div>
            <Link href="/promotion/level" className="shrink-0 rounded-md bg-bg px-3 py-2 text-xs font-medium">
              等级
            </Link>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Earnings" title="收益概览" href="/promotion/commission" actionLabel="明细" />
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="可提现余额" value="¥1,286.40" helper="以结算结果为准" tone="bg-muted" />
            <MetricCard label="昨日结算" value="¥168.20" helper="N+1 展示前一天" tone="bg-muted" />
            <MetricCard label="待结算佣金" value="¥392.80" helper="退款或扣回后更新" tone="bg-muted" />
            <MetricCard label="本月预估" value="¥3,426" helper="非实时最终金额" tone="bg-muted" />
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Tools" title="推广工具" />
          <ActionGrid items={toolEntries} columns={2} />
        </section>

        <section>
          <SectionHeader eyebrow="Entrances" title="活动与商品入口" />
          <div className="grid grid-cols-4 gap-2">
            {activityEntries.map((entry) => (
              <Link
                key={entry.label}
                href={entry.href}
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-border p-2"
              >
                <IconBlock tone={entry.tone} size="lg" label={entry.label} />
                <span className="text-center text-xs text-muted-fg">{entry.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Primary" title="核心入口" />
          <ActionGrid items={promotionEntries} columns={2} />
        </section>

        <section>
          <SectionHeader eyebrow="Products" title="推荐推广商品" href="/promotion/products" actionLabel="全部" />
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} actionLabel="去推广" showCommission />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
