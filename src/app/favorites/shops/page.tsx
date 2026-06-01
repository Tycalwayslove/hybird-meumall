import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const favoriteShops = [
  { name: "喵选生活馆", helper: "家居生活与香氛", tone: "bg-emerald-200", badge: "上新 12 件" },
  { name: "通勤装备局", helper: "包袋、数码和办公", tone: "bg-sky-200", badge: "热卖店铺" },
  { name: "轻食补给站", helper: "低糖坚果与健康零食", tone: "bg-amber-200", badge: "复购高" }
];

export default function FavoriteShopsPage() {
  return (
    <PageShell eyebrow="FAVORITES" title="店铺收藏" description="店铺主页和取消收藏能力后续接真实业务。">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/favorites/products" className="rounded-md border border-border px-3 py-2 text-center text-sm font-medium">
            商品
          </Link>
          <Link href="/favorites/shops" className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-fg">
            店铺
          </Link>
        </div>

        <section>
          <SectionHeader eyebrow="Saved" title="已收藏店铺" />
          <div className="space-y-3">
            {favoriteShops.map((shop) => (
              <article key={shop.name} className="rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  <PlaceholderMedia ratio="wide" tone={shop.tone} label="店铺图" className="w-20" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">{shop.name}</h2>
                      <IconBlock tone="bg-primary" size="sm" label="收藏" />
                    </div>
                    <p className="mt-1 text-xs leading-4 text-muted-fg">{shop.helper}</p>
                    <span className="mt-2 inline-flex rounded-sm bg-muted px-2 py-1 text-xs text-muted-fg">{shop.badge}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
