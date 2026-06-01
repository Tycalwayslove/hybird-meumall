import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { featuredProducts } from "@/lib/commerce/mock-data";

export default function SeckillPage() {
  const products = featuredProducts.slice(0, 4);

  return (
    <PageShell eyebrow="SECKILL" title="限时秒杀" description="活动列表骨架，倒计时和库存后续接服务端时间。">
      <div className="space-y-5">
        <PlaceholderMedia ratio="banner" tone="bg-rose-200" label="秒杀活动 banner 占位" />

        <section className="rounded-md border border-border bg-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-fg">本场结束</p>
              <h2 className="mt-1 text-xl font-semibold">02:18:36</h2>
            </div>
            <span className="rounded-md bg-muted px-3 py-2 text-xs text-muted-fg">服务端时间待接入</span>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Products" title="秒杀商品" />
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} actionLabel="立即秒杀" />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
