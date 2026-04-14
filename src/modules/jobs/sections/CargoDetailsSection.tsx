import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { CreateJobFormValues } from "@/modules/jobs/types";

type CargoDetailsSectionProps = {
  register: UseFormRegister<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
};

export function CargoDetailsSection({ register, errors }: CargoDetailsSectionProps) {
  return (
    <section className="space-y-4" id="cargo-details">
      <header>
        <h2 className="text-lg font-semibold">4. Cargo Details</h2>
        <p className="text-sm text-muted-foreground">Capture product quantity and weight.</p>
      </header>

      <div className="grid gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="cargo-description">
            Cargo Description
          </label>
          <Input
            id="cargo-description"
            placeholder="Describe the shipment goods"
            {...register("cargoDescription")}
          />
          {errors.cargoDescription?.message ? (
            <p className="text-xs text-danger">{errors.cargoDescription.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="cargo-quantity">
              Quantity
            </label>
            <Input id="cargo-quantity" placeholder="0" {...register("quantity")} />
            {errors.quantity?.message ? (
              <p className="text-xs text-danger">{errors.quantity.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="cargo-unit">
              Unit
            </label>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              id="cargo-unit"
              {...register("unit")}
            >
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="cargo-weight">
              Weight
            </label>
            <Input id="cargo-weight" placeholder="Optional" {...register("weight")} />
            {errors.weight?.message ? (
              <p className="text-xs text-danger">{errors.weight.message}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
