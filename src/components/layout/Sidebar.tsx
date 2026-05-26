"use client";

import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
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
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/appStore";
import { SidebarItem, type NavItem } from "@/components/layout/SidebarItem";


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
    <div
      className={cn(
        "flex h-16 items-center border-b border-border px-3",
        collapsed ? "justify-center" : "justify-between",
      )}
    >
      <span
        className={cn(
          "text-sm font-semibold tracking-tight transition-opacity duration-75",
          collapsed ? "opacity-0 hidden" : "opacity-100",
        )}
      >
        Simon Logistics
      </span>

      <button
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        onClick={onToggle}
        type="button"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
});

const SidebarNav = memo(function SidebarNav({
  collapsed,
  pathname,
  items,
}: {
  collapsed: boolean;
  pathname: string;
  items: NavItem[];
}) {
  return (
    <nav className={cn("flex-1 space-y-1 py-3", collapsed ? "px-1" : "px-2")}>
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <SidebarItem
            collapsed={collapsed}
            isActive={isActive}
            item={item}
            key={item.href}
          />
        );
      })}
    </nav>
  );
});

const SidebarFooter = memo(function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn("mt-auto border-t border-border px-3 py-3", collapsed ? "px-2" : "px-3")}
    />
  );
});

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { hasRole } = useRole();
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const visibleItems = useMemo(() => NAV_ITEMS.filter((item) => hasRole(item.roles)), [hasRole]);

  return (
    <aside
      className={cn(
        "relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-background",
        "transition-[width] duration-100 ease-out",
        sidebarCollapsed ? "w-[72px]" : "w-[240px]",
      )}
      style={{
        willChange: "width",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        contain: "layout paint",
      }}
    >
      <SidebarHeader collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <SidebarNav collapsed={sidebarCollapsed} items={visibleItems} pathname={pathname} />
      <SidebarFooter collapsed={sidebarCollapsed} />
    </aside>
  );
});
