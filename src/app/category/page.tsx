import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { commerceCategories } from "@/lib/commerce/mock-data";

export default function CategoryPage() {
  const activeCategory = commerceCategories[0];

  return (
    <PageShell current="/category" eyebrow="CATEGORY" title="商品分类">
      <div className="grid grid-cols-[104px_1fr] gap-3">
        <aside className="space-y-2">
          {commerceCategories.map((category, index) => (
            <div
              key={category.id}
              className={`flex min-h-12 items-center gap-2 rounded-md px-3 text-sm ${
                index === 0 ? "bg-muted font-medium" : "border border-border text-muted-fg"
              }`}
            >
              <IconBlock tone={category.iconTone} size="sm" />
              <span>{category.name}</span>
            </div>
          ))}
        </aside>

        <section>
          <div className="mb-3 rounded-md bg-muted p-3">
            <p className="text-xs text-muted-fg">当前频道</p>
            <h2 className="mt-1 text-lg font-semibold">{activeCategory.name}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-fg">本页为模拟分类结果，用于验证 App Router 页面与静态壳体验。</p>
          </div>
          <div className="grid gap-3">
            {activeCategory.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
