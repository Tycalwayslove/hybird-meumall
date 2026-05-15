type IconBlockProps = {
  tone: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-3 rounded-sm",
  md: "size-5 rounded-sm",
  lg: "size-10 rounded-md"
};

export function IconBlock({ tone, label, size = "md" }: IconBlockProps) {
  return <span aria-label={label} className={`inline-block shrink-0 ${sizeClass[size]} ${tone}`} />;
}
