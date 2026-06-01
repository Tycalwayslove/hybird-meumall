import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { mockOrders } from "@/lib/commerce/mock-data";

const statusTabs = ["全部", "待支付", "已完成", "售后"];

export default function OrdersPage() {
  return (
    <PageShell eyebrow="ORDERS" title="订单/购买记录" description="记录来自立即购买链路，不承载多商品合并购买流程。">
      <div className="space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab, index) => (
            <span
              key={tab}
              className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                index === 0 ? "bg-primary text-primary-fg" : "border border-border text-muted-fg"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <section>
          <SectionHeader eyebrow="Purchase" title="购买记录列表" />
          <div className="space-y-3">
            {mockOrders.map((order, index) => (
              <article key={order.id} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <IconBlock tone={index % 2 === 0 ? "bg-emerald-500" : "bg-amber-500"} size="lg" label="订单" />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">{order.title}</h2>
                      <p className="mt-1 text-xs leading-4 text-muted-fg">{order.id}</p>
                      <p className="mt-2 text-sm leading-5 text-muted-fg">{order.helper}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-xs text-muted-fg">{order.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-fg">实付金额</span>
                  <span className="text-lg font-semibold text-primary">¥{order.amount}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
