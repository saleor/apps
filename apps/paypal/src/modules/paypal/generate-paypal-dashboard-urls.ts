import { PayPalOrderId } from "./paypal-order-id";
import { PayPalEnv } from "./paypal-env";

export const generateOrderPayPalDashboardUrl = (args: {
  orderId: PayPalOrderId;
  env: PayPalEnv;
}): string => {
  const baseUrl = args.env === "LIVE" 
    ? "https://www.paypal.com" 
    : "https://www.sandbox.paypal.com";
    
  return `${baseUrl}/activity/payment/${args.orderId}`;
};