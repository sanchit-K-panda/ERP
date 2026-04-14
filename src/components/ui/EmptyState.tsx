import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border p-6 text-center">
      <h2 className="section-title">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-3" onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
