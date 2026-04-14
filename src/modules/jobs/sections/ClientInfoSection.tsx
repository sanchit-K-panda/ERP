import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { PartySelector } from "@/modules/parties/components/PartySelector";
import type { PartySearchResult } from "@/modules/parties/types";
import type { CreateJobFormValues } from "@/modules/jobs/types";

type ClientInfoSectionProps = {
  register: UseFormRegister<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
  selectedPartyId: string;
  selectedPartyName: string;
  onSelectParty: (party: PartySearchResult) => void;
  onClearParty: () => void;
};

export function ClientInfoSection({
  register,
  errors,
  selectedPartyId,
  selectedPartyName,
  onSelectParty,
  onClearParty,
}: ClientInfoSectionProps) {
  return (
    <section className="space-y-4" id="client-info">
      <header>
        <h2 className="text-lg font-semibold">1. Client Info</h2>
        <p className="text-sm text-muted-foreground">Select client and contact details.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="client-name">
            Party
          </label>
          <input type="hidden" {...register("clientName")} />
          <input type="hidden" {...register("partyId")} />

          <PartySelector
            inputId="client-name"
            onClear={onClearParty}
            onSelect={onSelectParty}
            placeholder="Search and select party"
            valueId={selectedPartyId}
            valueName={selectedPartyName}
          />

          {errors.partyId?.message || errors.clientName?.message ? (
            <p className="text-xs text-danger">{errors.partyId?.message || errors.clientName?.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="contact-person">
            Contact Person
          </label>
          <Input
            id="contact-person"
            placeholder="Optional contact name"
            {...register("contactPerson")}
          />
          {errors.contactPerson?.message ? (
            <p className="text-xs text-danger">{errors.contactPerson.message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
