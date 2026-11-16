import { createPath } from "@/lib/utils";

/*
 * Terminal uses the staff service API, so it is a configured choice rather than
 * a gateway advertised by Saleor's paymentGatewayInitialize flow.
 */
export const TERMINAL_GATEWAY_ID = "saleor.app.square.terminal";

export const getPaymentGatewayPath = ({
  envUrl,
  checkoutId,
  paymentGatewayId,
}: {
  envUrl: string;
  checkoutId: string;
  paymentGatewayId: string;
}) => {
  const root = createPath(
    "/env",
    encodeURIComponent(envUrl),
    "checkout",
    encodeURIComponent(checkoutId),
    "payment-gateway",
  );

  switch (paymentGatewayId) {
    case "app.saleor.adyen":
    case "app.saleor.adyen_staging":
    case "app.saleor.adyen_preview":
      return createPath(root, encodeURIComponent(paymentGatewayId));
    case "app.saleor.stripe":
    case "saleor.app.payment.stripe":
      return createPath(root, "stripe", encodeURIComponent(paymentGatewayId));
    case "saleor.app.square":
    case "saleor.app.square.dev":
      return createPath(root, "square", encodeURIComponent(paymentGatewayId));
    case TERMINAL_GATEWAY_ID:
      return createPath(root, "square", "terminal");
    default:
      return null;
  }
};
