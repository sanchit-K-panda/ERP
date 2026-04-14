import { JobDetailPage } from "@/modules/jobs/JobDetailPage";

type JobDetailRoutePageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailRoutePage({ params }: JobDetailRoutePageProps) {
  const { jobId } = await params;

  return <JobDetailPage jobId={jobId} />;
}
