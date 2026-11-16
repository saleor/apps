import { TerminalSummary } from "@/modules/square/terminal/components/terminal-summary";

export default async function TerminalSummaryPage({
  params,
}: {
  params: Promise<{ envUrl: string; checkoutId: string }>;
}) {
  const { envUrl, checkoutId } = await params;

  return <TerminalSummary saleorApiUrl={decodeURIComponent(envUrl)} checkoutId={checkoutId} />;
}
