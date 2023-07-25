export const messageEventTypes = [
  "ACCOUNT_CHANGE_EMAIL_CONFIRM",
  "ACCOUNT_CHANGE_EMAIL_REQUEST",
  "ACCOUNT_CONFIRMATION",
  "ACCOUNT_DELETE",
  "ACCOUNT_PASSWORD_RESET",
  "GIFT_CARD_SENT",
  "INVOICE_SENT",
  "ORDER_CANCELLED",
  "ORDER_CONFIRMED",
  "ORDER_CREATED",
  "ORDER_FULFILLED",
  "ORDER_FULFILLMENT_UPDATE",
  "ORDER_FULLY_PAID",
  "ORDER_REFUNDED",
] as const;

export type MessageEventTypes = (typeof messageEventTypes)[number];

export const messageEventTypesLabels: Record<MessageEventTypes, string> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: "Customer account change email confirmation",
  ACCOUNT_CHANGE_EMAIL_REQUEST: "Customer account change email request",
  ACCOUNT_CONFIRMATION: "Customer account confirmation",
  ACCOUNT_DELETE: "Customer account delete request",
  ACCOUNT_PASSWORD_RESET: "Customer account password reset request",
  GIFT_CARD_SENT: "Gift card sent",
  INVOICE_SENT: "Invoice sent",
  ORDER_CANCELLED: "Order cancelled",
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_CREATED: "Order created",
  ORDER_FULFILLED: "Order fulfilled",
  ORDER_FULFILLMENT_UPDATE: "Order fulfillment updated",
  ORDER_FULLY_PAID: "Order fully paid",
  ORDER_REFUNDED: "Order refunded",
};
