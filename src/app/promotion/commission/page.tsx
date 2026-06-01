import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const commissionRows = [
  { title: "轻量通勤托特包", status: "已结算", amount: "¥28.00", helper: "订单完成后按前一天数据结算" },
  { title: "无线降噪耳机", status: "待结算", amount: "¥42.00", helper: "退款、扣回或风控后可能调整" },
  { title: "低糖坚果礼盒", status: "预估", amount: "¥9.00", helper: "预估金额不代表实时最终金额" }
];

export default function PromotionCommissionPage() {
  return (
    <PageShell eyebrow="COMMISSION" title="佣金收益" description="N+1 展示前一天结算结果，不承诺实时最终金额。">
      <div className="space-y-6">
        <section className="rounded-md bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">结算口径</p>
          <h2 className="mt-1 text-xl font-semibold">昨日佣金在今天展示</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">
            本页按 N+1 骨架展示：今天看到的是前一天完成结算后的结果；当日成交仅作为预估，不作为最终可提现金额。
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard label="可提现余额" value="¥1,286.40" helper="已结算可提现" tone="bg-muted" />
          <MetricCard label="昨日结算" value="¥168.20" helper="N+1 结算结果" tone="bg-muted" />
          <MetricCard label="待结算" value="¥392.80" helper="等待订单完成" tone="bg-muted" />
          <MetricCard label="当日预估" value="¥86.50" helper="非实时最终金额" tone="bg-muted" />
        </section>

        <section>
          <SectionHeader eyebrow="Details" title="收益明细" />
          <div className="divide-y divide-border rounded-md border border-border">
            {commissionRows.map((row) => (
              <div key={row.title} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium">{row.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-fg">{row.helper}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">{row.amount}</p>
                    <p className="mt-1 text-xs text-muted-fg">{row.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border p-4">
          <h2 className="text-sm font-medium">提现入口占位</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">后续接入提现规则、冻结金额、退款扣回和审核状态。</p>
        </section>
      </div>
    </PageShell>
  );
}
