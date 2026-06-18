import { type PaymentMethodDetailsInputShape } from "@/modules/validation/transaction-create";

/**
 * Default values the Dummy Payment App proposes when creating a transaction.
 * Shared between the widget UI (pre-filled form fields) and the tRPC procedure
 * (server-side fallbacks) so the two never drift apart.
 */
export const DEFAULT_TRANSACTION_NAME = "Credit card (Dummy Payment App)";
export const DEFAULT_TRANSACTION_MESSAGE = "Created by Dummy Payment App";
export const DEFAULT_EVENT_MESSAGE = "Great success!";

export const DEFAULT_CARD_PAYMENT_METHOD: NonNullable<PaymentMethodDetailsInputShape["card"]> = {
  name: "Credit card",
  brand: "Visa",
  lastDigits: "4242",
  expMonth: 12,
  expYear: 2030,
};

export const DEFAULT_GIFT_CARD_PAYMENT_METHOD: NonNullable<
  PaymentMethodDetailsInputShape["giftCard"]
> = {
  name: "Gift card",
};

export const DEFAULT_OTHER_PAYMENT_METHOD: NonNullable<PaymentMethodDetailsInputShape["other"]> = {
  name: "Other",
};
