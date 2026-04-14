"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import type { PermissionFeature, PermissionMatrix, PermissionRoleKey } from "@/modules/settings/types";

const ROLE_COLUMNS: PermissionRoleKey[] = ["Owner", "Manager", "Sales"];

const FEATURE_ROWS: PermissionFeature[] = ["Jobs", "Shipments", "Finance", "Reports", "Settings"];

const INITIAL_MATRIX: PermissionMatrix = {
  Jobs: {
    Owner: { read: true, write: true },
    Manager: { read: true, write: true },
    Sales: { read: true, write: true },
  },
  Shipments: {
    Owner: { read: true, write: true },
    Manager: { read: true, write: true },
    Sales: { read: true, write: false },
  },
  Finance: {
    Owner: { read: true, write: true },
    Manager: { read: true, write: true },
    Sales: { read: false, write: false },
  },
  Reports: {
    Owner: { read: true, write: true },
    Manager: { read: true, write: false },
    Sales: { read: true, write: false },
  },
  Settings: {
    Owner: { read: true, write: true },
    Manager: { read: true, write: false },
    Sales: { read: false, write: false },
  },
};

type PermissionToggleProps = {
  enabled: boolean;
  label: string;
  onToggle: () => void;
};

function PermissionToggle({ enabled, label, onToggle }: PermissionToggleProps) {
  return (
    <button
      className={cn(
        "inline-flex h-6 min-w-10 items-center justify-center rounded-md border px-2 text-[11px] font-medium transition-colors",
        enabled
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-border bg-background text-muted-foreground",
      )}
      onClick={onToggle}
      type="button"
    >
      {label}
    </button>
  );
}

export function RolePermissionsPanel() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(INITIAL_MATRIX);

  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Role & Permissions (UI-level)</h2>
        <p className="text-xs text-muted-foreground">
          Informational permission matrix for dashboard governance. No backend enforcement.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/35">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Feature
              </th>
              {ROLE_COLUMNS.map((role) => (
                <th
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  key={role}
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_ROWS.map((feature) => (
              <tr className="border-b border-border/70" key={feature}>
                <td className="px-3 py-2 font-medium text-foreground">{feature}</td>
                {ROLE_COLUMNS.map((role) => (
                  <td className="px-3 py-2" key={role}>
                    <div className="flex items-center gap-1">
                      <PermissionToggle
                        enabled={matrix[feature][role].read}
                        label="R"
                        onToggle={() =>
                          setMatrix((previous) => ({
                            ...previous,
                            [feature]: {
                              ...previous[feature],
                              [role]: {
                                ...previous[feature][role],
                                read: !previous[feature][role].read,
                              },
                            },
                          }))
                        }
                      />
                      <PermissionToggle
                        enabled={matrix[feature][role].write}
                        label="W"
                        onToggle={() =>
                          setMatrix((previous) => ({
                            ...previous,
                            [feature]: {
                              ...previous[feature],
                              [role]: {
                                ...previous[feature][role],
                                write: !previous[feature][role].write,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
