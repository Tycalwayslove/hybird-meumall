import Link from "next/link";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeader({ eyebrow, title, href, actionLabel = "查看" }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-medium uppercase text-muted-fg">{eyebrow}</p> : null}
        <h2 className="truncate text-lg font-semibold">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-medium text-primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
