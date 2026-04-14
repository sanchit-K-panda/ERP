import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { CreateJobFormValues } from "@/modules/jobs/types";

type BasicFinancialSectionProps = {
  register: UseFormRegister<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
};

export function BasicFinancialSection({ register, errors }: BasicFinancialSectionProps) {
  return (
    <section className="space-y-4" id="financial">
      <header>
        <h2 className="text-lg font-semibold">6. Basic Financial</h2>
        <p className="text-sm text-muted-foreground">Capture estimated costs and job notes.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-foreground" htmlFor="estimated-cost">
            Estimated Cost
          </label>
          <Input id="estimated-cost" placeholder="0.00" {...register("estimatedCost")} />
          {errors.estimatedCost?.message ? (
            <p className="text-xs text-danger">{errors.estimatedCost.message}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-foreground" htmlFor="currency">
            Currency
          </label>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            id="currency"
            {...register("currency")}
          >
            <option value="INR">INR</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-3">
          <label className="text-sm font-medium text-foreground" htmlFor="notes">
            Notes
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="notes"
            placeholder="Add operational notes"
            {...register("notes")}
          />
          {errors.notes?.message ? (
            <p className="text-xs text-danger">{errors.notes.message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
