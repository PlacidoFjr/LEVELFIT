import { notFound } from "next/navigation";
import { ProRunAthleteDetailPage } from "@/components/pro-run-page";
import { runAthletes } from "@/lib/pro-run-mock-data";

export function generateStaticParams() {
  return runAthletes.map((athlete) => ({ athleteId: athlete.id }));
}

export default async function Page({ params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params;
  if (!runAthletes.some((athlete) => athlete.id === athleteId)) notFound();
  return <ProRunAthleteDetailPage athleteId={athleteId} />;
}
