import { cn } from "../utils/cn";

const toneClassNames = {
  brand: "bg-brand-subtle text-brand-action",
  muted: "bg-fill-muted text-text-muted",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  success: "bg-success-subtle text-success"
} as const;

type AssetPlaceholderProps = {
  label?: string;
  className?: string;
  tone?: keyof typeof toneClassNames;
};

export function AssetPlaceholder({ label, className, tone = "muted" }: AssetPlaceholderProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-card text-[11px] font-black leading-none",
        toneClassNames[tone],
        className
      )}
    >
      {label ? label.slice(0, 2) : null}
    </span>
  );
}
