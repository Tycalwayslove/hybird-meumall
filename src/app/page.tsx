import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { ProductCard } from "@/components/commerce/ProductCard";
import { commerceCategories, featuredProducts } from "@/lib/commerce/mock-data";

const quickEntries = [
  { label: "新品首发", href: "/category", tone: "bg-emerald-500" },
  { label: "限时补贴", href: "/category", tone: "bg-rose-500" },
  { label: "品质家居", href: "/category", tone: "bg-amber-500" },
  { label: "数码热榜", href: "/category", tone: "bg-violet-500" }
];

export default function HomePage() {
  return (
    <PageShell
      current="/"
      eyebrow="MEUMALL"
      title="今日好物"
      trailing={<span className="rounded-md bg-muted px-3 py-2 text-xs text-muted-fg">模拟版</span>}
    >
      <section className="rounded-md bg-muted p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-fg">春夏焕新</p>
            <h2 className="mt-1 text-2xl font-semibold leading-8">精选通勤、家居和轻食组合</h2>
            <Link
              href="/category"
              className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg"
            >
              去逛逛
            </Link>
          </div>
          <div className="grid w-24 shrink-0 grid-cols-2 gap-2">
            <span className="h-12 rounded-md bg-sky-300" />
            <span className="h-16 rounded-md bg-emerald-300" />
            <span className="h-16 rounded-md bg-amber-300" />
            <span className="h-12 rounded-md bg-rose-300" />
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-4 gap-2">
        {quickEntries.map((entry) => (
          <Link key={entry.label} href={entry.href} className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
            <IconBlock tone={entry.tone} size="lg" label={entry.label} />
            <span className="text-center text-xs text-muted-fg">{entry.label}</span>
          </Link>
        ))}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-fg">Categories</p>
            <h2 className="text-lg font-semibold">热门频道</h2>
          </div>
          <Link href="/category" className="text-sm text-primary">
            全部
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {commerceCategories.map((category) => (
            <Link
              key={category.id}
              href="/category"
              className="flex min-w-28 items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <IconBlock tone={category.iconTone} />
              <span className="text-sm">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3">
          <p className="text-xs text-muted-fg">Recommended</p>
          <h2 className="text-lg font-semibold">猜你喜欢</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
