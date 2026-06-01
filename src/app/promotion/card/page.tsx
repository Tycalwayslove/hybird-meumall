import Link from "next/link";
import { IconBlock } from "@/components/commerce/IconBlock";
import { PageShell } from "@/components/commerce/PageShell";
import { PlaceholderMedia } from "@/components/commerce/PlaceholderMedia";
import { SectionHeader } from "@/components/commerce/SectionHeader";

const cardActions = [
  { label: "分享名片", tone: "bg-sky-500" },
  { label: "保存图片", tone: "bg-emerald-500" },
  { label: "复制口令", tone: "bg-amber-500" }
];

export default function PromotionCardPage() {
  return (
    <PageShell eyebrow="CARD" title="我的名片" description="个人推广名片和二维码占位，分享与保存由后续 Hybrid 能力承接。">
      <div className="space-y-6">
        <section className="rounded-md border border-border bg-bg p-4">
          <div className="flex items-center gap-3">
            <PlaceholderMedia ratio="avatar" tone="bg-primary" label="头像" />
            <div>
              <h2 className="text-xl font-semibold">喵呜体验官</h2>
              <p className="mt-1 text-sm text-muted-fg">V3 成长达人 · 专属推广名片</p>
            </div>
          </div>
          <div className="mt-5 rounded-md bg-muted p-5">
            <PlaceholderMedia ratio="qr" tone="bg-bg" label="二维码占位" />
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-muted-fg">二维码用于推广承接，真实有效期和刷新规则后续确认。</p>
        </section>

        <section>
          <SectionHeader eyebrow="Actions" title="名片操作" />
          <div className="grid grid-cols-3 gap-2">
            {cardActions.map((action) => (
              <div key={action.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-border">
                <IconBlock tone={action.tone} size="lg" label={action.label} />
                <span className="text-xs text-muted-fg">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/promotion/products"
          className="flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
        >
          去选择推广商品
        </Link>
      </div>
    </PageShell>
  );
}
