import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { getProductById } from "@/lib/commerce/mock-data";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <PageShell current="/category" eyebrow="PRODUCT" title="商品详情">
      <section>
        <div className={`aspect-square rounded-md ${product.imageTone}`} />
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-fg">{product.badge}</span>
          <IconBlock tone="bg-primary" size="sm" label="占位图标" />
          <span className="text-xs text-muted-fg">本地模拟商品</span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold leading-8">{product.name}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-fg">{product.subtitle}</p>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-3xl font-semibold text-primary">¥{product.price}</p>
          {product.originalPrice ? <p className="pb-1 text-sm text-muted-fg line-through">¥{product.originalPrice}</p> : null}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-medium">规格</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.specs.map((spec) => (
            <span key={spec} className="rounded-md border border-border px-3 py-2 text-sm">
              {spec}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-md bg-muted p-4">
        <div className="flex items-center gap-3">
          <IconBlock tone="bg-emerald-500" size="lg" label="服务占位" />
          <div>
            <h3 className="text-sm font-medium">服务承诺</h3>
            <p className="mt-1 text-xs leading-5 text-muted-fg">模拟展示：7 天无理由、极速发货、售后无忧。</p>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-20 border-t border-border bg-bg px-5 py-3">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_1.4fr] gap-3">
          <Link href="/cart" className="rounded-md border border-border px-4 py-3 text-center text-sm font-medium">
            加入购物车
          </Link>
          <Link href="/cart" className="rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-fg">
            立即购买
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
