type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: string;
};

export function MetricCard({ label, value, helper, tone = "bg-muted" }: MetricCardProps) {
  return (
    <div className={`rounded-md border border-border p-3 ${tone}`}>
      <p className="text-xs text-muted-fg">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-4 text-muted-fg">{helper}</p> : null}
    </div>
  );
}
