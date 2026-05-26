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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <div
          className={cn(
            "h-[calc(100vh-64px)]",
            isJobsListRoute ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          <div className="px-6 py-6 lg:px-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
