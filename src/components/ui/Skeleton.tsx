import { cn } from "@/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />;
}
