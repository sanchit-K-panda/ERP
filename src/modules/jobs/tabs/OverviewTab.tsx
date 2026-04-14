import { format, parseISO } from "date-fns";
import { JOB_STATUS_ORDER, type JobRecord } from "@/modules/jobs/types";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";

type OverviewTabProps = {
  job: JobRecord;
};

export function OverviewTab({ job }: OverviewTabProps) {
  const currentIndex = JOB_STATUS_ORDER.indexOf(job.status);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
          <p className="mt-1 text-sm font-medium text-foreground">{job.clientName}</p>
          <p className="text-xs text-muted-foreground">
            Contact: {job.contactPerson || "Not provided"}
          </p>
        </div>

        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Route</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {job.originHub} {"->"} {job.destinationHub}
          </p>
          <p className="text-xs text-muted-foreground">Created {format(parseISO(job.createdDate), "dd-MMM-yyyy")}</p>
        </div>

        <div className="rounded-md border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Service</p>
          <p className="mt-1 text-sm font-medium text-foreground">{job.serviceType}</p>
          <div className="mt-2">
            <JobStatusBadge status={job.status} />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border p-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Cargo</p>
        <p className="mt-1 text-sm font-medium text-foreground">{job.cargoDescription}</p>
        <p className="text-xs text-muted-foreground">
          Qty {job.quantity} {job.unit} {job.weight ? `• ${job.weight} weight` : ""}
        </p>
      </div>

      <div className="rounded-md border border-border p-3">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Status Timeline</p>
        <ol className="grid gap-2 md:grid-cols-5">
          {JOB_STATUS_ORDER.map((status, index) => {
            const reached = currentIndex >= index && job.status !== "Cancelled";
            return (
              <li className="rounded-md border border-border px-2 py-2 text-xs" key={status}>
                <p className={reached ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {status}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
