import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "muted" | "info" | "success" | "warning" | "danger";
type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant };

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border bg-muted text-foreground",
  muted: "border-border bg-background text-muted-foreground",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  success:
    "border-[rgb(var(--success-border))] bg-[rgb(var(--success-soft))] text-[rgb(var(--success))]",
  warning:
    "border-[rgb(var(--warning-border))] bg-[rgb(var(--warning-soft))] text-[rgb(var(--warning))]",
  danger:
    "border-[rgb(var(--error-border))] bg-[rgb(var(--error-soft))] text-[rgb(var(--error))]",
};

export function Badge({ className, children, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
