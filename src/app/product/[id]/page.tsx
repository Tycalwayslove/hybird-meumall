import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { SectionHeader } from "@/components/commerce/SectionHeader";
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
    <PageShell eyebrow="PRODUCT" title="商品详情" description="购买路径为立即购买到订单确认。">
      <div className="space-y-6 pb-24">
        <section>
          <PlaceholderMedia ratio="square" tone={product.imageTone} label="商品图占位" />
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-fg">{product.badge}</span>
            {product.commission ? (
              <span className="rounded-sm bg-primary px-2 py-1 text-xs text-primary-fg">推广佣金 ¥{product.commission}</span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-8">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-fg">{product.subtitle}</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-semibold text-primary">¥{product.price}</p>
            {product.originalPrice ? <p className="pb-1 text-sm text-muted-fg line-through">¥{product.originalPrice}</p> : null}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Specs" title="规格选择" />
          <div className="flex flex-wrap gap-2">
            {product.specs.map((spec) => (
              <span key={spec} className="rounded-md border border-border px-3 py-2 text-sm">
                {spec}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-bg p-4">
          <div className="flex items-start gap-3">
            <IconBlock tone="bg-emerald-500" size="lg" label="服务" />
            <div>
              <h3 className="text-sm font-medium">服务与交易提示</h3>
              <p className="mt-1 text-xs leading-5 text-muted-fg">价格、库存和可购买状态在真实交易前需要实时确认。</p>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-bg p-4">
          <SectionHeader eyebrow="Detail" title="商品详情骨架" />
          <div className="space-y-2">
            <PlaceholderMedia ratio="banner" tone="bg-muted" label="详情模块占位" />
            <p className="text-sm leading-6 text-muted-fg">后续接入正式详情、评价、售后规则和推广素材信息。</p>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_1.4fr] gap-3">
          <Link href="/consult" className="rounded-md border border-border px-4 py-3 text-center text-sm font-medium">
            咨询
          </Link>
          <Link href="/order-confirm" className="rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-fg">
            立即购买
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
