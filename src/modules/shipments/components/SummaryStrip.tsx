import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";
import type { ShipmentSummary } from "@/modules/shipments/types";

type SummaryStripProps = {
  summary: ShipmentSummary;
};

const SUMMARY_ITEMS = [
  {
    id: "totalShipments",
    label: "Total Shipments",
    icon: Package,
  },
  {
    id: "inTransit",
    label: "In Transit",
    icon: Truck,
  },
  {
    id: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
  },
  {
    id: "delayed",
    label: "Delayed",
    icon: AlertTriangle,
  },
] as const;

export function SummaryStrip({ summary }: SummaryStripProps) {
  return (
    <section className="rounded-lg border border-border bg-background">
      <ul className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {SUMMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li className="flex items-center justify-between px-4 py-3" key={item.id}>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold leading-none text-foreground">
                  {summary[item.id]}
                </p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
