import type { CSSProperties, ReactNode } from "react";

import { AppScreen } from "@/design-system";

type PromotionShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function PromotionShell({ children, className, style }: PromotionShellProps) {
  return (
    <AppScreen className={className} style={style}>
      {children}
    </AppScreen>
  );
}
