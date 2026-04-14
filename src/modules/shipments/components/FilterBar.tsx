import { CalendarRange, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FreightType, ShipmentFilters, ShipmentStatus } from "@/modules/shipments/types";

type FilterBarProps = {
  filters: ShipmentFilters;
  onFilterChange: (next: Partial<ShipmentFilters>) => void;
  onAddShipment: () => void;
};

const STATUS_OPTIONS: Array<ShipmentStatus | "All"> = [
  "All",
  "Processing",
  "In Transit",
  "Delivered",
  "Delayed",
];

const FREIGHT_OPTIONS: Array<FreightType | "All"> = ["All", "Air", "Sea"];

export function FilterBar({ filters, onFilterChange, onAddShipment }: FilterBarProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-3">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => onFilterChange({ search: event.target.value, page: 1 })}
            placeholder="Search by shipment, tracking, or job ID"
            value={filters.search}
          />
        </div>

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
            onChange={(event) =>
              onFilterChange({
                status: event.target.value as ShipmentStatus | "All",
                page: 1,
              })
            }
            value={filters.status}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            onChange={(event) =>
              onFilterChange({
                freightType: event.target.value as FreightType | "All",
                page: 1,
              })
            }
            value={filters.freightType}
          >
            {FREIGHT_OPTIONS.map((freightType) => (
              <option key={freightType} value={freightType}>
                {freightType === "All" ? "All Freight Types" : freightType}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(event) => onFilterChange({ fromDate: event.target.value, page: 1 })}
              type="date"
              value={filters.fromDate}
            />
          </div>
          <Input
            onChange={(event) => onFilterChange({ toDate: event.target.value, page: 1 })}
            type="date"
            value={filters.toDate}
          />
        </div>

        <Button onClick={onAddShipment}>
          <Plus className="h-4 w-4" />
          Add Shipment
        </Button>
      </div>
    </section>
  );
}
