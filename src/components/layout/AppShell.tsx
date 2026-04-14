"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/utils/cn";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isJobsListRoute = pathname === "/jobs";

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      <div
        className="h-screen transition-[padding-left] duration-150 ease-out"
        style={{ paddingLeft: "var(--shell-offset, 240px)" }}
      >
        <Header />
        <main
          className={cn(
            "h-full pt-[60px]",
            isJobsListRoute ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          <div className="container h-full min-h-0 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
