import { TerminalPayment } from "@/modules/square/terminal/components/terminal-payment";
import { isTerminalConfigured } from "@/modules/square/terminal/server-config";

export default async function TerminalPage({
  params,
}: {
  params: Promise<{ envUrl: string; checkoutId: string }>;
}) {
  const { envUrl, checkoutId } = await params;

  if (!isTerminalConfigured())
    return <p className="p-6">Square Terminal is not configured on this test client.</p>;

  return <TerminalPayment saleorApiUrl={decodeURIComponent(envUrl)} checkoutId={checkoutId} />;
}
