import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

type TableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function TableSkeleton({ rows = 8, className }: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <div className="h-11 border-b border-border bg-muted/40" />
      <div className="space-y-2 p-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton className="h-10" key={index} />
        ))}
      </div>
    </div>
  );
}
