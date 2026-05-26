"use client";

import Link from "next/link";
import { memo, type ComponentType } from "react";
import { cn } from "@/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Role } from "@/types/auth";

type IconType = ComponentType<{ className?: string }>;

export type NavItem = {
  href: string;
  label: string;
  roles: Role[];
  icon: IconType;
};

type SidebarItemProps = {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
};

export const SidebarItem = memo(function SidebarItem({
  item,
  collapsed,
  isActive,
}: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 w-full items-center border text-sm",
        "transition-[background-color,border-color,color] duration-150 ease-out",
        "hover:border-border hover:text-foreground",
        collapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
        collapsed ? "rounded-xl" : "rounded-md",
        isActive
          ? "border-accent/30 bg-muted text-foreground"
          : "border-transparent text-muted-foreground",
      )}
      style={{
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
      href={item.href}
    >
      {!collapsed && isActive ? (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
      ) : null}

      {collapsed ? (
        <Tooltip content={item.label}>
          <span className="inline-flex h-5 w-5 items-center justify-center">
            <Icon className="h-5 w-5 shrink-0" />
          </span>
        </Tooltip>
      ) : (
        <Icon className="h-5 w-5 shrink-0" />
      )}

      <span
        className={cn(
          "truncate transition-opacity duration-75",
          collapsed ? "opacity-0 hidden" : "opacity-100",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
});
