import { notFound } from "next/navigation";
import { ProClientDetailPage } from "@/components/pro-pages";
import { getClient, proClients } from "@/lib/pro-mock-data";

export function generateStaticParams() {
  return proClients.map((client) => ({ clientId: client.id }));
}

export default async function Page({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  if (!getClient(clientId)) notFound();
  return <ProClientDetailPage clientId={clientId} />;
}

