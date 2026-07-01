import type { CSSProperties, HTMLAttributes } from "react";

import { resolveIconFontClass, type IconFontName } from "../icons";
import { cn } from "../utils/cn";

type IconFontProps = Omit<HTMLAttributes<HTMLSpanElement>, "children" | "aria-label"> & {
  name: IconFontName;
  label?: string;
  size?: number | string;
};

export function IconFont({ className, label, name, size, style, ...props }: IconFontProps) {
  const rawClass = resolveIconFontClass(name);
  const fontSize = typeof size === "number" ? `${size}px` : size;
  const mergedStyle = fontSize ? ({ fontSize, ...style } as CSSProperties) : style;

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn("meu-iconfont", `meu-iconfont-${rawClass}`, className)}
      role={label ? "img" : undefined}
      style={mergedStyle}
      {...props}
    />
  );
}
