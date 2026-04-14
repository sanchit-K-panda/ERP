import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-accent-foreground hover:opacity-95 active:opacity-90",
  secondary:
    "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "border border-transparent bg-transparent text-foreground hover:bg-muted",
  danger:
    "border border-danger bg-danger text-white hover:opacity-95 active:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
