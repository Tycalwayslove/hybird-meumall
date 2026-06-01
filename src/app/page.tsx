import Link from "next/link";
import { ActionGrid } from "@/components/commerce/ActionGrid";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { commerceCategories, featuredProducts, homeEntries } from "@/lib/commerce/mock-data";

export default function HomePage() {
  const seckillProducts = featuredProducts.slice(0, 2);
  const recommendedProducts = featuredProducts.slice(0, 4);

  return (
    <PageShell
      eyebrow="MEUMALL"
      title="首页内容"
      description="H5 只承载首页内容区，底部主 Tab 由原生 App 提供。"
      trailing={
        <Link href="/messages" className="rounded-md border border-border px-3 py-2 text-sm font-medium">
          消息
        </Link>
      }
    >
      <div className="space-y-6 pb-4">
        <Link href="/category" className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-bg px-3">
          <IconBlock tone="bg-muted" size="md" label="搜索" />
          <span className="text-sm text-muted-fg">搜索商品、分类和活动</span>
        </Link>

        <section>
          <PlaceholderMedia ratio="banner" tone="bg-muted" label="首页 banner 占位" />
        </section>

        <section>
          <SectionHeader eyebrow="Category" title="分类入口" href="/category" actionLabel="全部" />
          <div className="grid grid-cols-5 gap-2">
            {commerceCategories.map((category) => (
              <Link key={category.id} href="/category" className="rounded-md border border-border p-2 text-center">
                <IconBlock tone={category.iconTone} size="lg" label={category.name} className="mx-auto" />
                <span className="mt-2 block text-xs leading-4 text-muted-fg">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <ActionGrid items={homeEntries} columns={4} />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/seckill" className="rounded-md border border-border bg-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-fg">限时活动</p>
                <h2 className="mt-1 text-base font-semibold">限时秒杀</h2>
              </div>
              <IconBlock tone="bg-rose-500" size="lg" label="秒杀" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-fg">倒计时和库存后续接实时服务。</p>
          </Link>
          <Link href="/promotion" className="rounded-md border border-border bg-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-fg">达人能力</p>
                <h2 className="mt-1 text-base font-semibold">推广带货</h2>
              </div>
              <IconBlock tone="bg-amber-500" size="lg" label="推广" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-fg">佣金按 N+1 结算，入口先占位。</p>
          </Link>
        </section>

        <section>
          <SectionHeader eyebrow="Seckill" title="秒杀精选" href="/seckill" actionLabel="更多" />
          <div className="grid grid-cols-2 gap-3">
            {seckillProducts.map((product) => (
              <ProductCard key={product.id} product={product} actionLabel="立即秒杀" />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Recommended" title="推荐商品" href="/category" actionLabel="换一批" />
          <div className="grid grid-cols-2 gap-3">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showCommission />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
