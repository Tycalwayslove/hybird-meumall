import type { ReactNode } from "react";

import { cn } from "../utils/cn";

type StateViewProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function StateView({ action, className, description, title }: StateViewProps) {
  return (
    <div className={cn("flex min-h-24 flex-col items-center justify-center rounded-card bg-fill-white px-6 py-8 text-center", className)}>
      <p className="text-bodyStrong text-text-primary">{title}</p>
      {description ? <p className="mt-2 text-caption text-text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
