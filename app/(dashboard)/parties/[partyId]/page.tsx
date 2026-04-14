import { PartyDetailPage } from "@/modules/parties/PartyDetailPage";

type PartyDetailRoutePageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export default async function PartyDetailRoutePage({ params }: PartyDetailRoutePageProps) {
  const { partyId } = await params;

  return <PartyDetailPage partyId={partyId} />;
}
