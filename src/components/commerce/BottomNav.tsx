import Link from "next/link";
import { commerceNavItems } from "@/lib/commerce/mock-data";
import { IconBlock } from "./IconBlock";

type BottomNavProps = {
  current: string;
};

export function BottomNav({ current }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {commerceNavItems.map((item) => {
          const active = item.href === current;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs ${
                active ? "bg-muted text-fg" : "text-muted-fg"
              }`}
            >
              <IconBlock tone={item.iconTone} size="sm" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
