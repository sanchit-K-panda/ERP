"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useContextStore } from "@/store/contextStore";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const activeCompany = useContextStore((state) => state.activeCompany);
  const activeHub = useContextStore((state) => state.activeHub);
  const clearContext = useContextStore((state) => state.clearContext);

  const menuItems = useMemo(
    () => [
      {
        id: "switch-company",
        label: "Switch Company",
        onSelect: () => {
          clearContext();
          router.push("/select-company");
        },
      },
      {
        id: "logout",
        label: "Logout",
        onSelect: () => {
          logout();
          clearContext();
          router.push("/login");
        },
      },
    ],
    [clearContext, logout, router],
  );

  return (
    <header
      className="fixed right-0 top-0 z-30 h-[60px] border-b border-border bg-background/95 backdrop-blur transition-[left] duration-150 ease-out"
      style={{ left: "var(--shell-offset, 240px)" }}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors duration-150 hover:bg-muted"
            onClick={() => {
              clearContext();
              router.push("/select-company");
            }}
            type="button"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[180px] truncate">
              {activeCompany?.name ?? "No Company"}
            </span>
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted"
            onClick={() => {
              router.push(activeCompany ? "/select-hub" : "/select-company");
            }}
            type="button"
          >
            <span className="max-w-[160px] truncate">
              {activeHub?.name ?? "No Hub"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden min-w-[300px] max-w-[420px] flex-1 lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search jobs, shipments, parties..." />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            type="button"
          >
            <Bell className="h-4 w-4" />
          </button>

          <DropdownMenu
            items={menuItems}
            triggerLabel={user?.name ?? "User"}
          />
        </div>
      </div>
    </header>
  );
}
