type PlaceholderMediaProps = {
  tone?: string;
  label?: string;
  ratio?: "square" | "banner" | "wide" | "avatar" | "qr";
  className?: string;
};

const ratioClass = {
  square: "aspect-square rounded-md",
  banner: "aspect-[16/7] rounded-md",
  wide: "aspect-[4/3] rounded-md",
  avatar: "size-14 rounded-full",
  qr: "aspect-square rounded-md"
};

export function PlaceholderMedia({
  tone = "bg-muted",
  label,
  ratio = "square",
  className = ""
}: PlaceholderMediaProps) {
  return (
    <div
      aria-label={label}
      className={`flex shrink-0 items-center justify-center overflow-hidden ${ratioClass[ratio]} ${tone} ${className}`}
    >
      {label ? <span className="px-2 text-center text-[11px] font-medium text-muted-fg">{label}</span> : null}
    </div>
  );
}
