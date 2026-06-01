import Link from "next/link";
import { PageShell } from "./PageShell";
import { PlaceholderMedia } from "./PlaceholderMedia";

type LowFiPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  blocks: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

export function LowFiPage({ eyebrow, title, description, blocks, primaryHref = "/", primaryLabel = "返回首页" }: LowFiPageProps) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <div className="space-y-4">
        <PlaceholderMedia ratio="banner" tone="bg-muted" label="页面头图占位" />
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block} className="rounded-md border border-border bg-bg p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-fg">
                  {index + 1}
                </span>
                <p className="text-sm leading-6">{block}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href={primaryHref} className="flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg">
          {primaryLabel}
        </Link>
      </div>
    </PageShell>
  );
}
