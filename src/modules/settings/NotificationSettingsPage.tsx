"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { settingsService } from "@/services/settingsService";
import { cn } from "@/utils/cn";
import type { NotificationSettings } from "@/modules/settings/types";

type NotificationGroupKey = keyof NotificationSettings;

type ChannelKey = keyof NotificationSettings["financeAlerts"];

const GROUP_LABELS: Record<NotificationGroupKey, string> = {
  financeAlerts: "Finance alerts",
  shipmentAlerts: "Shipment alerts",
  systemAlerts: "System alerts",
};

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  inApp: "In-app",
  email: "Email",
  sms: "SMS",
};

function ToggleButton({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 min-w-20 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors",
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

export function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NotificationSettings | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const notificationQuery = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: settingsService.getNotificationSettings,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateNotificationSettings,
    onSuccess: (updatedSettings) => {
      queryClient.invalidateQueries({ queryKey: ["settings", "notifications"] });
      setDraft(updatedSettings);
      setFeedback("Notification settings updated.");
    },
  });

  const currentSettings = draft ?? notificationQuery.data ?? null;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Notification Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure channel-level alerts for finance, shipments, and system operations.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Alert Channel Matrix</h2>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/35">
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Alert Group
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  In-app
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(GROUP_LABELS) as NotificationGroupKey[]).map((group) => (
                <tr className="border-b border-border/70" key={group}>
                  <td className="px-3 py-2 font-medium text-foreground">{GROUP_LABELS[group]}</td>
                  {(Object.keys(CHANNEL_LABELS) as ChannelKey[]).map((channel) => (
                    <td className="px-3 py-2" key={channel}>
                      <ToggleButton
                        enabled={Boolean(currentSettings?.[group]?.[channel])}
                        label={currentSettings?.[group]?.[channel] ? "On" : "Off"}
                        onToggle={() =>
                          setDraft((previous) => {
                            const base = previous ?? notificationQuery.data;

                            if (!base) {
                              return previous;
                            }

                            return {
                              ...base,
                              [group]: {
                                ...base[group],
                                [channel]: !base[group][channel],
                              },
                            };
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {feedback ?? "Changes are stored in mock settings service."}
        </p>
        <Button
          disabled={!currentSettings || updateMutation.isPending || notificationQuery.isLoading}
          onClick={() => {
            if (!currentSettings) {
              return;
            }

            setFeedback(null);
            updateMutation.mutate(currentSettings);
          }}
          type="button"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Notification Settings"}
        </Button>
      </div>
    </section>
  );
}
