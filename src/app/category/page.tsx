import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { commerceCategories, featuredProducts } from "@/lib/commerce/mock-data";

export default function CategoryPage() {
  const activeCategory = commerceCategories[0];

  return (
    <PageShell eyebrow="CATEGORY" title="商品分类" description="分类结果骨架，当前使用本地 mock 数据展示。">
      <div className="space-y-5">
        <div className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-bg px-3">
          <IconBlock tone="bg-muted" size="md" label="搜索" />
          <span className="text-sm text-muted-fg">搜索分类内商品</span>
        </div>

        <div className="grid grid-cols-[104px_1fr] gap-3">
          <aside className="space-y-2">
            {commerceCategories.map((category, index) => (
              <div
                key={category.id}
                className={`flex min-h-12 items-center gap-2 rounded-md px-3 text-sm ${
                  index === 0 ? "bg-muted font-medium" : "border border-border text-muted-fg"
                }`}
              >
                <IconBlock tone={category.iconTone} size="sm" label={category.name} />
                <span className="leading-5">{category.name}</span>
              </div>
            ))}
          </aside>

          <section className="min-w-0">
            <PlaceholderMedia ratio="wide" tone="bg-muted" label="分类 banner 占位" />
            <div className="mt-4">
              <SectionHeader eyebrow="Current" title={activeCategory.name} />
              <div className="grid gap-3">
                {activeCategory.products.map((product) => (
                  <ProductCard key={product.id} product={product} actionLabel="查看" />
                ))}
              </div>
            </div>
          </section>
        </div>

        <section>
          <SectionHeader eyebrow="All" title="全部推荐" />
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
