import Link from "next/link";
import { PageShell } from "@/components/commerce/PageShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeader } from "@/components/commerce/SectionHeader";
import { featuredProducts } from "@/lib/commerce/mock-data";

export default function FavoriteProductsPage() {
  const products = featuredProducts.slice(0, 4);

  return (
    <PageShell eyebrow="FAVORITES" title="商品收藏" description="用户私有收藏弱快照，删除和状态以后接真实接口。">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/favorites/products" className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-fg">
            商品
          </Link>
          <Link href="/favorites/shops" className="rounded-md border border-border px-3 py-2 text-center text-sm font-medium">
            店铺
          </Link>
        </div>

        <section>
          <SectionHeader eyebrow="Saved" title="已收藏商品" />
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} actionLabel="查看" />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
