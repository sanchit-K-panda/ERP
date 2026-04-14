import type { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { CreateJobFormValues, ServiceType } from "@/modules/jobs/types";

const SERVICE_TYPES: Array<{ label: ServiceType; description: string; disabled?: boolean }> = [
  { label: "Shipping Only", description: "Logistics handling without procurement." },
  {
    label: "Purchase + Shipping",
    description: "Vendor purchase and shipping in one workflow.",
  },
  {
    label: "Full Service",
    description: "Reserved for future release.",
    disabled: true,
  },
];

type ServiceTypeSectionProps = {
  watch: UseFormWatch<CreateJobFormValues>;
  setValue: UseFormSetValue<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
};

export function ServiceTypeSection({ watch, setValue, errors }: ServiceTypeSectionProps) {
  const selectedServiceType = watch("serviceType");

  return (
    <section className="space-y-4" id="service-type">
      <header>
        <h2 className="text-lg font-semibold">2. Service Type</h2>
        <p className="text-sm text-muted-foreground">Pick the service model for this job.</p>
      </header>

      <div className="grid gap-2">
        {SERVICE_TYPES.map((item) => {
          const isActive = selectedServiceType === item.label;

          return (
            <button
              className={
                isActive
                  ? "rounded-md border border-accent bg-muted px-3 py-3 text-left"
                  : "rounded-md border border-border bg-background px-3 py-3 text-left"
              }
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                if (!item.disabled) {
                  setValue("serviceType", item.label, { shouldDirty: true, shouldValidate: true });
                }
              }}
              type="button"
            >
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </button>
          );
        })}
      </div>

      {errors.serviceType?.message ? (
        <p className="text-xs text-danger">{errors.serviceType.message}</p>
      ) : null}
    </section>
  );
}
