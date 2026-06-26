/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";

import { localAssetUrl, type LocalAssetKey } from "@/lib/assets";

import { cn } from "../utils/cn";

type EmptyStateProps = {
  className?: string;
  gap?: number | string;
  imageAlt?: string;
  imageAssetKey?: LocalAssetKey;
  imageClassName?: string;
  imageSize?: number | string;
  imageStyle?: CSSProperties;
  style?: CSSProperties;
  text?: ReactNode;
  textClassName?: string;
  textColor?: string;
  textSize?: number | string;
  textStyle?: CSSProperties;
};

const DEFAULT_BASE_PATH = process.env.NEXT_PUBLIC_H5_BASE_PATH || process.env.H5_BASE_PATH || "/hybird";

export function EmptyState({
  className,
  gap = 12,
  imageAlt,
  imageAssetKey = "placeholder.emptyState",
  imageClassName,
  imageSize = 160,
  imageStyle,
  style,
  text = "这里空空如也～",
  textClassName,
  textColor = "#575757",
  textSize = 14,
  textStyle
}: EmptyStateProps) {
  const resolvedGap = toCssSize(gap);
  const resolvedImageSize = toCssSize(imageSize);
  const resolvedTextSize = toCssSize(textSize);

  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center text-center", className)}
      data-empty-state="true"
      style={{
        gap: resolvedGap,
        ...style
      }}
    >
      <img
        alt={imageAlt ?? ""}
        aria-hidden={imageAlt ? undefined : true}
        className={cn("block max-w-full object-contain", imageClassName)}
        src={localAssetUrl(imageAssetKey, { basePath: DEFAULT_BASE_PATH })}
        style={{
          height: resolvedImageSize,
          width: resolvedImageSize,
          ...imageStyle
        }}
      />
      <p
        className={cn("m-0 max-w-full break-words text-center font-medium leading-normal", textClassName)}
        style={{
          color: textColor,
          fontSize: resolvedTextSize,
          ...textStyle
        }}
      >
        {text}
      </p>
    </div>
  );
}

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}
