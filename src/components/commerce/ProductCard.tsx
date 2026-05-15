import Link from "next/link";
import type { MockProduct } from "@/lib/commerce/mock-data";

type ProductCardProps = {
  product: MockProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={product.href} className="block rounded-md border border-border bg-bg p-3">
      <div className={`aspect-square rounded-md ${product.imageTone}`} />
      <div className="mt-3 min-h-24">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-fg">{product.badge}</span>
          <span className="h-2 w-6 rounded-sm bg-primary" />
        </div>
        <h2 className="mt-2 line-clamp-2 text-sm font-medium leading-5">{product.name}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-fg">{product.subtitle}</p>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-lg font-semibold text-primary">¥{product.price}</p>
        {product.originalPrice ? <p className="text-xs text-muted-fg line-through">¥{product.originalPrice}</p> : null}
      </div>
    </Link>
  );
}
