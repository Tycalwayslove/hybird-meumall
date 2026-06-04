import type { ReactNode } from "react";

import { cn } from "../utils/cn";

const surfaceVariants = {
  default: "bg-fill-white text-text-primary",
  muted: "bg-fill-muted text-text-primary",
  brand: "bg-brand-subtle text-text-primary",
  inverse: "bg-text-primary text-text-inverse"
} as const;

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof surfaceVariants;
};

export function Surface({ children, className, variant = "default" }: SurfaceProps) {
  return <div className={cn("rounded-card", surfaceVariants[variant], className)}>{children}</div>;
}
