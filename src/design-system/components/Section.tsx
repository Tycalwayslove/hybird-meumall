import type { ReactNode } from "react";

import { cn } from "../utils/cn";

type SectionProps = {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
};

export function Section({ action, children, className, contentClassName, title }: SectionProps) {
  return (
    <section className={cn("rounded-card bg-fill-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-[18px] pt-[14px]">
          {title ? <h2 className="text-sectionTitle text-text-primary">{title}</h2> : <span />}
          {action}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
