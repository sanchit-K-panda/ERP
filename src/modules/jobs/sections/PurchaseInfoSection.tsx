import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { CreateJobFormValues } from "@/modules/jobs/types";

type PurchaseInfoSectionProps = {
  register: UseFormRegister<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
};

export function PurchaseInfoSection({ register, errors }: PurchaseInfoSectionProps) {
  return (
    <section className="space-y-4" id="purchase-info">
      <header>
        <h2 className="text-lg font-semibold">5. Purchase Info</h2>
        <p className="text-sm text-muted-foreground">Required for purchase + shipping jobs.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="supplier-name">
            Supplier Name
          </label>
          <Input
            id="supplier-name"
            placeholder="Supplier or vendor name"
            {...register("supplierName")}
          />
          {errors.supplierName?.message ? (
            <p className="text-xs text-danger">{errors.supplierName.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="purchase-amount">
            Purchase Amount
          </label>
          <Input id="purchase-amount" placeholder="0.00" {...register("purchaseAmount")} />
          {errors.purchaseAmount?.message ? (
            <p className="text-xs text-danger">{errors.purchaseAmount.message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
