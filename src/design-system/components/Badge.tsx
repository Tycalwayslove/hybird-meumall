import type { ReactNode } from "react";

import { cn } from "../utils/cn";

const badgeVariants = {
  brand: "bg-brand-subtle text-brand-action",
  neutral: "bg-fill-muted text-text-muted",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  inverse: "bg-fill-white text-text-primary"
} as const;

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof badgeVariants;
};

export function Badge({ children, className, variant = "neutral" }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-pill px-2 py-1 text-[12px] font-bold leading-none", badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
