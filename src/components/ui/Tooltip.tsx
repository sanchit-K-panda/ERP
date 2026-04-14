"use client";

import type { ReactNode } from "react";

export function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm transition-opacity duration-150 group-focus-within:block group-hover:block">
        {content}
      </span>
    </span>
  );
}
