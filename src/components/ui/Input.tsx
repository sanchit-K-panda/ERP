import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-[border-color,background-color,color,box-shadow] duration-150 ease-out",
          "hover:border-slate-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
