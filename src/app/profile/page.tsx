import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";

const orderEntries = [
  { label: "待付款", tone: "bg-amber-500" },
  { label: "待发货", tone: "bg-sky-500" },
  { label: "待收货", tone: "bg-emerald-500" },
  { label: "售后", tone: "bg-rose-500" }
];

const serviceEntries = ["地址管理", "优惠券", "会员权益", "客服中心"];

export default function ProfilePage() {
  return (
    <PageShell current="/profile" eyebrow="PROFILE" title="我的">
      <section className="rounded-md bg-muted p-4">
        <div className="flex items-center gap-3">
          <IconBlock tone="bg-primary" size="lg" label="头像占位" />
          <div>
            <h2 className="text-lg font-semibold">模拟会员</h2>
            <p className="mt-1 text-sm text-muted-fg">WebView H5 本地演示账号</p>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">我的订单</h2>
          <span className="text-sm text-muted-fg">全部订单</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {orderEntries.map((entry) => (
            <div key={entry.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-border">
              <IconBlock tone={entry.tone} />
              <span className="text-xs text-muted-fg">{entry.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold">常用服务</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {serviceEntries.map((entry, index) => (
            <div key={entry} className="flex min-h-12 items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <IconBlock tone={index % 2 === 0 ? "bg-emerald-500" : "bg-violet-500"} size="sm" />
                <span className="text-sm">{entry}</span>
              </div>
              <span className="h-2 w-5 rounded-sm bg-border" />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
