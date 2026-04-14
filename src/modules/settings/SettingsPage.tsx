"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Building2, Settings2, Users } from "lucide-react";
import { RolePermissionsPanel } from "@/modules/settings/RolePermissionsPanel";
import { settingsService } from "@/services/settingsService";

const USER_SUMMARY_FILTERS = {
  search: "",
  role: "All",
  status: "All",
  page: 1,
  pageSize: 200,
} as const;

const HUB_SUMMARY_FILTERS = {
  search: "",
  type: "All",
  page: 1,
  pageSize: 200,
} as const;

const SETTINGS_SECTIONS = [
  {
    href: "/settings/users",
    title: "User Management",
    description: "Create users, assign roles, and control account status.",
    icon: Users,
  },
  {
    href: "/settings/company",
    title: "Company Settings",
    description: "Maintain business profile, code, and operational status.",
    icon: Building2,
  },
  {
    href: "/settings/hubs",
    title: "Hub Settings",
    description: "Manage hub locations, types, and availability.",
    icon: Settings2,
  },
  {
    href: "/settings/notifications",
    title: "Notification Settings",
    description: "Tune finance, shipment, and system alert channels.",
    icon: Bell,
  },
] as const;

export function SettingsPage() {
  const usersQuery = useQuery({
    queryKey: ["settings", "users", "overview"],
    queryFn: () => settingsService.getUsers(USER_SUMMARY_FILTERS),
    staleTime: 30_000,
  });

  const hubsQuery = useQuery({
    queryKey: ["settings", "hubs", "overview"],
    queryFn: () => settingsService.getHubs(HUB_SUMMARY_FILTERS),
    staleTime: 30_000,
  });

  const companyQuery = useQuery({
    queryKey: ["settings", "company"],
    queryFn: settingsService.getCompanySettings,
    staleTime: 30_000,
  });

  const notificationQuery = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: settingsService.getNotificationSettings,
    staleTime: 30_000,
  });

  const activeUsers = usersQuery.data?.rows.filter((row) => row.status === "Active").length ?? 0;
  const totalUsers = usersQuery.data?.rows.length ?? 0;
  const enabledHubs = hubsQuery.data?.rows.filter((row) => row.enabled).length ?? 0;
  const totalHubs = hubsQuery.data?.rows.length ?? 0;

  const activeAlertChannels = notificationQuery.data
    ? [
        ...Object.values(notificationQuery.data.financeAlerts),
        ...Object.values(notificationQuery.data.shipmentAlerts),
        ...Object.values(notificationQuery.data.systemAlerts),
      ].filter(Boolean).length
    : 0;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-muted-foreground">
          System control center for users, permissions, company profile, hubs, and alerting.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background">
        <ul className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Users</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {activeUsers}/{totalUsers}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Active / Total</p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hubs</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {enabledHubs}/{totalHubs}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Enabled / Total</p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Company</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {companyQuery.data?.status ?? "-"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Operational status</p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Alert Channels</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {activeAlertChannels}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Enabled channels</p>
          </li>
        </ul>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/35">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Module
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {SETTINGS_SECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <tr className="border-b border-border/70" key={item.href}>
                  <td className="px-3 py-2">
                    <div className="inline-flex items-center gap-2 font-medium text-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.title}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.description}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
                      href={item.href}
                    >
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <RolePermissionsPanel />
    </section>
  );
}
