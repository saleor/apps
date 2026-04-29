export const messageEventTypes = [
  "ACCOUNT_CHANGE_EMAIL_CONFIRM",
  "ACCOUNT_CHANGE_EMAIL_REQUEST",
  "ACCOUNT_CHANGE_EMAIL_REQUESTED",
  "ACCOUNT_EMAIL_CHANGED",
  "ACCOUNT_CONFIRMATION",
  "ACCOUNT_CONFIRMATION_REQUESTED",
  "ACCOUNT_DELETE",
  "ACCOUNT_DELETE_REQUESTED",
  "ACCOUNT_PASSWORD_RESET",
  "ACCOUNT_SET_PASSWORD_REQUESTED",
  "FULFILLMENT_APPROVED",
  "FULFILLMENT_CANCELED",
  "FULFILLMENT_CREATED",
  "FULFILLMENT_TRACKING_NUMBER_UPDATED",
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

export interface MessageEventTypeMetadata {
  label: string;
  deprecated?: boolean;
  /**
   * When `deprecated` is true, points users to the modern event that replaces it.
   * Surfaced in the dashboard so merchants can migrate their templates.
   */
  replacedBy?: MessageEventTypes;
}

export const messageEventTypesLabels: Record<MessageEventTypes, MessageEventTypeMetadata> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: {
    label: "Customer account change email confirmation (legacy)",
    deprecated: true,
    replacedBy: "ACCOUNT_EMAIL_CHANGED",
  },
  ACCOUNT_CHANGE_EMAIL_REQUEST: {
    label: "Customer account change email request (legacy)",
    deprecated: true,
    replacedBy: "ACCOUNT_CHANGE_EMAIL_REQUESTED",
  },
  ACCOUNT_CHANGE_EMAIL_REQUESTED: { label: "Customer account change email request" },
  ACCOUNT_EMAIL_CHANGED: { label: "Customer account email changed" },
  ACCOUNT_CONFIRMATION: {
    label: "Customer account confirmation (legacy)",
    deprecated: true,
    replacedBy: "ACCOUNT_CONFIRMATION_REQUESTED",
  },
  ACCOUNT_CONFIRMATION_REQUESTED: { label: "Customer account confirmation" },
  ACCOUNT_DELETE: {
    label: "Customer account delete request (legacy)",
    deprecated: true,
    replacedBy: "ACCOUNT_DELETE_REQUESTED",
  },
  ACCOUNT_DELETE_REQUESTED: { label: "Customer account delete request" },
  ACCOUNT_PASSWORD_RESET: {
    label: "Customer account password reset request (legacy)",
    deprecated: true,
    replacedBy: "ACCOUNT_SET_PASSWORD_REQUESTED",
  },
  ACCOUNT_SET_PASSWORD_REQUESTED: { label: "Customer account password reset request" },
  FULFILLMENT_APPROVED: { label: "Fulfillment approved" },
  FULFILLMENT_CANCELED: { label: "Fulfillment canceled" },
  FULFILLMENT_CREATED: { label: "Fulfillment created" },
  FULFILLMENT_TRACKING_NUMBER_UPDATED: { label: "Fulfillment tracking number updated" },
  GIFT_CARD_SENT: { label: "Gift card sent" },
  INVOICE_SENT: { label: "Invoice sent" },
  ORDER_CANCELLED: { label: "Order cancelled" },
  ORDER_CONFIRMED: { label: "Order confirmed" },
  ORDER_CREATED: { label: "Order created" },
  ORDER_FULFILLED: { label: "Order fulfilled" },
  ORDER_FULFILLMENT_UPDATE: {
    label: "Order fulfillment updated (legacy)",
    deprecated: true,
    replacedBy: "FULFILLMENT_TRACKING_NUMBER_UPDATED",
  },
  ORDER_FULLY_PAID: { label: "Order fully paid" },
  ORDER_REFUNDED: { label: "Order refunded" },
};
