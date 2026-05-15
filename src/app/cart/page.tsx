import Link from "next/link";
import { PageShell } from "@/components/commerce/PageShell";
import { getCartLines } from "@/lib/commerce/mock-data";

export default function CartPage() {
  const cartLines = getCartLines();
  const total = cartLines.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <PageShell current="/cart" eyebrow="CART" title="购物车">
      <section className="space-y-3">
        {cartLines.map((line) => (
          <div key={line.productId} className="grid grid-cols-[76px_1fr] gap-3 rounded-md border border-border p-3">
            <div className={`aspect-square rounded-md ${line.product.imageTone}`} />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium">{line.product.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-fg">{line.product.subtitle}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-base font-semibold text-primary">¥{line.product.price}</p>
                <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm">
                  <span className="h-3 w-3 rounded-sm bg-border" />
                  <span>{line.quantity}</span>
                  <span className="h-3 w-3 rounded-sm bg-primary" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-md bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-fg">模拟合计</span>
          <span className="text-2xl font-semibold text-primary">¥{total}</span>
        </div>
        <Link href="/profile" className="mt-4 block rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-fg">
          去结算
        </Link>
      </section>
    </PageShell>
  );
}
