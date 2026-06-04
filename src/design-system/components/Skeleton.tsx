import { cn } from "../utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <span className={cn("block animate-pulse rounded-md bg-fill-muted", className)} />;
}
