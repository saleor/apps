import { PayPalOrder } from "./types";

/**
 * Payment source types for PayPal orders
 */
export type PaymentSourceType = "PAYPAL" | "VENMO" | "CARD" | "UNKNOWN";

/**
 * Detects which payment method was used for a PayPal order
 *
 * This is important for:
 * - Displaying correct payment method on thank you pages
 * - Analytics and reporting
 * - Handling payment-method-specific business logic
 *
 * @param order - The PayPal order response
 * @returns The payment source type
 */
export function detectPaymentSource(order: PayPalOrder): PaymentSourceType {
  const paymentSource = order.payment_source;

  if (!paymentSource) {
    return "UNKNOWN";
  }

  // Check in priority order (some orders might have multiple sources defined)
  if (paymentSource.venmo) {
    return "VENMO";
  }

  if (paymentSource.card) {
    return "CARD";
  }

  if (paymentSource.paypal) {
    return "PAYPAL";
  }

  return "UNKNOWN";
}

/**
 * Gets a human-readable payment method name
 */
export function getPaymentMethodName(sourceType: PaymentSourceType): string {
  switch (sourceType) {
    case "PAYPAL":
      return "PayPal";
    case "VENMO":
      return "Venmo";
    case "CARD":
      return "Credit/Debit Card";
    case "UNKNOWN":
      return "Unknown Payment Method";
  }
}

/**
 * Extracts buyer email from payment source
 */
export function getBuyerEmail(order: PayPalOrder): string | null {
  const paymentSource = order.payment_source;

  if (!paymentSource) {
    return null;
  }

  // Try to get email from different payment sources
  if (paymentSource.venmo?.email_address) {
    return paymentSource.venmo.email_address;
  }

  if (paymentSource.paypal?.email_address) {
    return paymentSource.paypal.email_address;
  }

  return null;
}

/**
 * Checks if order was paid with Venmo
 */
export function isVenmoPayment(order: PayPalOrder): boolean {
  return detectPaymentSource(order) === "VENMO";
}

/**
 * Checks if order was paid with PayPal wallet
 */
export function isPayPalWalletPayment(order: PayPalOrder): boolean {
  return detectPaymentSource(order) === "PAYPAL";
}

/**
 * Checks if order was paid with card
 */
export function isCardPayment(order: PayPalOrder): boolean {
  return detectPaymentSource(order) === "CARD";
}
