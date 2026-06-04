import { cn } from "../utils/cn";

type MetricProps = {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
};

export function Metric({ label, value, className, valueClassName }: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="truncate text-[13px] leading-[18px] text-text-secondary">{label}</p>
      <p className={cn("mt-2 truncate text-metric text-text-primary", valueClassName)}>{value}</p>
    </div>
  );
}
