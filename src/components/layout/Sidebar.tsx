"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useEffect, useMemo, type ComponentType } from "react";
import {
  FileText,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ChartNoAxesColumn,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { SIDEBAR_ROUTE_RULES } from "@/constants/navigation";
import { useRole } from "@/hooks/useRole";
import type { Role } from "@/types/auth";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/appStore";
import { Tooltip } from "@/components/ui/Tooltip";

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_TRANSITION = "180ms cubic-bezier(0.4, 0, 0.2, 1)";

type NavItem = {
  href: string;
  label: string;
  roles: Role[];
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: SIDEBAR_ROUTE_RULES.dashboard,
  },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness, roles: SIDEBAR_ROUTE_RULES.jobs },
  { href: "/finance", label: "Finance", icon: Wallet, roles: SIDEBAR_ROUTE_RULES.finance },
  {
    href: "/warehouse",
    label: "Warehouse",
    icon: Package,
    roles: SIDEBAR_ROUTE_RULES.warehouse,
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FileText,
    roles: SIDEBAR_ROUTE_RULES.documents,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: ChartNoAxesColumn,
    roles: SIDEBAR_ROUTE_RULES.reports,
  },
  {
    href: "/freight/shipments",
    label: "Freight",
    icon: Truck,
    roles: SIDEBAR_ROUTE_RULES.freight,
  },
  {
    href: "/parties",
    label: "Parties",
    icon: Users,
    roles: SIDEBAR_ROUTE_RULES.parties,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: SIDEBAR_ROUTE_RULES.settings,
  },
];

const SidebarHeader = memo(function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex h-[60px] items-center justify-between border-b border-border px-3">
      <p
        className={cn(
          "text-sm font-semibold tracking-tight transition-[opacity,transform] duration-150 ease-out",
          collapsed ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100",
        )}
      >
        Simon Logistics
      </p>

      {collapsed ? (
        <p className="absolute left-3 text-xs font-semibold tracking-widest">SL</p>
      ) : null}

      <button
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        onClick={onToggle}
        type="button"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
});

const SidebarItems = memo(function SidebarItems({
  collapsed,
  pathname,
  items,
}: {
  collapsed: boolean;
  pathname: string;
  items: NavItem[];
}) {
  return (
    <nav className="flex-1 space-y-1 px-2 py-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "group relative flex h-10 items-center rounded-md border px-2 text-sm",
              "transition-[background-color,border-color,color,transform] duration-150 ease-out",
              "hover:border-border hover:text-foreground",
              collapsed ? "justify-center" : "justify-start",
              isActive
                ? "border-accent/30 bg-muted/70 text-foreground"
                : "border-transparent text-muted-foreground",
            )}
            data-active={isActive}
            href={item.href}
            key={item.href}
          >
            {isActive ? (
              <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
            ) : null}

            {collapsed ? (
              <Tooltip content={item.label}>
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
              </Tooltip>
            ) : (
              <Icon className="h-4 w-4 shrink-0" />
            )}

            <span
              className={cn(
                "ml-3 origin-left whitespace-nowrap transition-[opacity,transform] duration-150 ease-out",
                collapsed
                  ? "pointer-events-none absolute -translate-x-1 scale-x-95 opacity-0"
                  : "translate-x-0 scale-x-100 opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { hasRole } = useRole();
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const visibleItems = useMemo(() => NAV_ITEMS.filter((item) => hasRole(item.roles)), [hasRole]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--shell-offset",
      `${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH}px`,
    );

    return () => {
      document.documentElement.style.setProperty("--shell-offset", `${SIDEBAR_EXPANDED_WIDTH}px`);
    };
  }, [sidebarCollapsed]);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 border-r border-border bg-background"
      style={{
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        transition: `width ${SIDEBAR_TRANSITION}`,
      }}
    >
      <div className="flex h-full flex-col">
        <SidebarHeader collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <SidebarItems collapsed={sidebarCollapsed} items={visibleItems} pathname={pathname} />
      </div>
    </aside>
  );
});
