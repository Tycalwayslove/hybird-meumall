import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { MetricCard } from "@/components/commerce/MetricCard";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { featuredProducts } from "@/lib/commerce/mock-data";

export default function OrderConfirmPage() {
  const product = featuredProducts[0];

  return (
    <PageShell eyebrow="ORDER" title="订单确认" description="交易确认低保真骨架，真实提交前需实时校验价格和库存。">
      <div className="space-y-5 pb-24">
        <section className="rounded-md border border-border bg-bg p-4">
          <div className="flex items-start gap-3">
            <IconBlock tone="bg-emerald-500" size="lg" label="地址" />
            <div>
              <h2 className="text-sm font-medium">收货信息占位</h2>
              <p className="mt-1 text-xs leading-5 text-muted-fg">展示登录用户默认收货信息，真实数据后续接入。</p>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-bg p-4">
          <SectionHeader eyebrow="Product" title="确认商品" />
          <div className="flex gap-3">
            <PlaceholderMedia tone={product.imageTone} label="商品图" className="w-24" />
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-sm font-medium leading-5">{product.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-fg">{product.subtitle}</p>
              <p className="mt-3 text-lg font-semibold text-primary">¥{product.price}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard label="商品金额" value={`¥${product.price}`} helper="以实时确认为准" />
          <MetricCard label="预计佣金" value={`¥${product.commission ?? 0}`} helper="N+1 结算口径" />
        </section>

        <section className="rounded-md border border-border bg-bg p-4">
          <SectionHeader eyebrow="Checklist" title="交易校验项" />
          <div className="space-y-2 text-sm leading-6 text-muted-fg">
            <p>价格、库存、活动资格和用户登录态需要在提交前实时确认。</p>
            <p>支付流程优先交由原生 App 或后续交易能力承接。</p>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-fg">合计</p>
            <p className="text-xl font-semibold text-primary">¥{product.price}</p>
          </div>
          <Link href="/" className="rounded-md bg-primary px-6 py-3 text-center text-sm font-medium text-primary-fg">
            提交确认
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
