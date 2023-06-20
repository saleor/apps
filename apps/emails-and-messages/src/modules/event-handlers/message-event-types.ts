export const messageEventTypes = [
  "ORDER_CREATED",
  "ORDER_FULFILLED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "ORDER_FULLY_PAID",
  "INVOICE_SENT",
  "ACCOUNT_CONFIRMATION",
  "ACCOUNT_PASSWORD_RESET",
  "ACCOUNT_CHANGE_EMAIL_REQUEST",
  "ACCOUNT_CHANGE_EMAIL_CONFIRM",
  "ACCOUNT_DELETE",
  "GIFT_CARD_SENT",
] as const;

export type MessageEventTypes = (typeof messageEventTypes)[number];

export const messageEventTypesLabels: Record<MessageEventTypes, string> = {
  ORDER_CREATED: "Order created",
  ORDER_FULFILLED: "Order fulfilled",
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_CANCELLED: "Order cancelled",
  ORDER_FULLY_PAID: "Order fully paid",
  INVOICE_SENT: "Invoice sent",
  GIFT_CARD_SENT: "Gift card sent",
  ACCOUNT_CONFIRMATION: "Customer account confirmation",
  ACCOUNT_PASSWORD_RESET: "Customer account password reset request",
  ACCOUNT_CHANGE_EMAIL_REQUEST: "Customer account change email request",
  ACCOUNT_CHANGE_EMAIL_CONFIRM: "Customer account change email confirmation",
  ACCOUNT_DELETE: "Customer account delete request",
};
