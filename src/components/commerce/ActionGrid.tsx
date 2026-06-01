import Link from "next/link";
import { IconBlock } from "./IconBlock";

export type ActionGridItem = {
  label: string;
  href: string;
  tone: string;
  helper?: string;
};

type ActionGridProps = {
  items: ActionGridItem[];
  columns?: 2 | 3 | 4;
};

const columnClass = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4"
};

export function ActionGrid({ items, columns = 4 }: ActionGridProps) {
  return (
    <div className={`grid ${columnClass[columns]} gap-2`}>
      {items.map((item) => (
        <Link key={`${item.href}-${item.label}`} href={item.href} className="rounded-md border border-border bg-bg p-3">
          <IconBlock tone={item.tone} size="lg" label={item.label} />
          <p className="mt-2 text-sm font-medium leading-5">{item.label}</p>
          {item.helper ? <p className="mt-1 text-xs leading-4 text-muted-fg">{item.helper}</p> : null}
        </Link>
      ))}
    </div>
  );
}
