import type { ReactNode } from "react";
import type { CSSProperties } from "react";

import { cn } from "../utils/cn";

type AppScreenProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

export function AppScreen({ children, className, contentClassName, style }: AppScreenProps) {
  return (
    <main className={cn("min-h-screen bg-fill-page text-text-primary", className)} style={style}>
      <div className={cn("mx-auto min-h-screen w-full max-w-[430px] overflow-hidden", contentClassName)}>{children}</div>
    </main>
  );
}
