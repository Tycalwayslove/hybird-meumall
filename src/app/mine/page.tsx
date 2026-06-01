import Link from "next/link";
import { ActionGrid } from "@/components/commerce/ActionGrid";
import { IconBlock } from "@/components/commerce/IconBlock";
import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { mineEntries, mockOrders } from "@/lib/commerce/mock-data";

const earningMetrics = [
  { label: "可提现余额", value: "¥328.50", helper: "N+1 结算后可用" },
  { label: "待结算佣金", value: "¥92.00", helper: "含昨日推广预估" }
];

const settingRows = ["账号资料", "地址管理", "通知偏好", "App 原生设置"];

export default function MinePage() {
  return (
    <PageShell eyebrow="MINE" title="我的" description="H5 只承载内容页，一级 Tab 由原生 App 管理。">
      <div className="space-y-6">
        <section className="rounded-md border border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <PlaceholderMedia ratio="avatar" tone="bg-primary" label="头像" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">喵呜达人</p>
              <p className="mt-1 text-sm leading-5 text-muted-fg">已登录用户默认具备达人身份</p>
            </div>
            <span className="rounded-md bg-bg px-2.5 py-1 text-xs font-medium text-primary">V2</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricCard label="收藏" value="18" helper="商品与店铺" />
            <MetricCard label="购买记录" value="3" helper="直接购买" />
            <MetricCard label="达人等级" value="V2" helper="会员同体系" />
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Member" title="会员/达人入口" href="/member" actionLabel="进入" />
          <Link href="/member" className="flex items-center gap-3 rounded-md border border-border p-4">
            <IconBlock tone="bg-violet-500" size="lg" label="会员达人" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">会员权益与达人能力</p>
              <p className="mt-1 text-sm leading-5 text-muted-fg">同一套等级体系，查看权益、佣金能力和成长任务。</p>
            </div>
            <span className="h-2 w-6 rounded-sm bg-border" />
          </Link>
        </section>

        <section>
          <SectionHeader eyebrow="Quick" title="常用入口" />
          <ActionGrid items={mineEntries} columns={2} />
        </section>

        <section>
          <SectionHeader eyebrow="Earnings" title="收益概览" href="/promotion/commission" actionLabel="明细" />
          <div className="grid grid-cols-2 gap-3">
            {earningMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} tone="bg-muted" />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Orders" title="最近购买记录" href="/orders" actionLabel="全部" />
          <div className="space-y-2">
            {mockOrders.slice(0, 2).map((order) => (
              <Link key={order.id} href="/orders" className="block rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.title}</p>
                    <p className="mt-1 text-xs leading-4 text-muted-fg">{order.helper}</p>
                  </div>
                  <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-xs text-muted-fg">{order.status}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-primary">¥{order.amount}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Settings" title="设置入口" />
          <div className="divide-y divide-border rounded-md border border-border">
            {settingRows.map((row, index) => (
              <div key={row} className="flex min-h-12 items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <IconBlock tone={index % 2 === 0 ? "bg-emerald-500" : "bg-sky-500"} size="sm" label={row} />
                  <span className="text-sm">{row}</span>
                </div>
                <span className="h-2 w-5 rounded-sm bg-border" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
