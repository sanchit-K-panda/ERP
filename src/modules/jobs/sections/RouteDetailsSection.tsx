import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { CreateJobFormValues } from "@/modules/jobs/types";

type RouteDetailsSectionProps = {
  register: UseFormRegister<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
  hubs: string[];
};

export function RouteDetailsSection({ register, errors, hubs }: RouteDetailsSectionProps) {
  return (
    <section className="space-y-4" id="route-details">
      <header>
        <h2 className="text-lg font-semibold">3. Route Details</h2>
        <p className="text-sm text-muted-foreground">Define origin and destination route.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="origin-hub">
            Origin Hub
          </label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            id="origin-hub"
            {...register("originHub")}
          >
            <option value="">Select origin hub</option>
            {hubs.map((hub) => (
              <option key={hub} value={hub}>
                {hub}
              </option>
            ))}
          </select>
          {errors.originHub?.message ? (
            <p className="text-xs text-danger">{errors.originHub.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="destination-hub">
            Destination Hub
          </label>
          <Input id="destination-hub" readOnly {...register("destinationHub")} />
          {errors.destinationHub?.message ? (
            <p className="text-xs text-danger">{errors.destinationHub.message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
