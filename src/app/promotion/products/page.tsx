import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { featuredProducts } from "@/lib/commerce/mock-data";

const filterTabs = ["综合", "高佣金", "新品", "活动中"];

export default function PromotionProductsPage() {
  return (
    <PageShell eyebrow="PROMOTION" title="推广商品" description="选择商品，进入商品详情或后续生成推广素材。">
      <div className="space-y-5">
        <section className="rounded-md bg-muted p-4">
          <p className="text-xs font-medium text-muted-fg">商品池骨架</p>
          <h2 className="mt-1 text-xl font-semibold">高佣商品和活动商品入口</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">商品基础信息使用本地模拟数据，佣金字段用于页面结构占位。</p>
        </section>

        <section className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab, index) => (
            <span
              key={tab}
              className={`shrink-0 rounded-md px-3 py-2 text-sm ${
                index === 0 ? "bg-primary text-primary-fg" : "border border-border text-muted-fg"
              }`}
            >
              {tab}
            </span>
          ))}
        </section>

        <section>
          <SectionHeader eyebrow="List" title="可推广商品" />
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} actionLabel="去推广" showCommission />
            ))}
          </div>
        </section>

        <Link
          href="/promotion/card"
          className="flex min-h-12 items-center justify-between rounded-md border border-border px-4 text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <IconBlock tone="bg-sky-500" size="sm" />
            使用我的名片承接推广
          </span>
          <span className="h-2 w-5 rounded-sm bg-border" />
        </Link>
      </div>
    </PageShell>
  );
}
