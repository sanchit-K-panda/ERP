import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={className ?? "rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"} role="alert">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          {message}
        </p>
        {onRetry ? (
          <Button onClick={onRetry} size="sm" variant="secondary">
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
