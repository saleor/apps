import { AppWebhook } from "./webhook-management-service";

export type WebhookStatuses = Record<AppWebhook, boolean>;

export const webhookStatusesFactory = ({
  enabledWebhooks,
}: {
  enabledWebhooks?: AppWebhook[];
}): WebhookStatuses => ({
  // TODO: This function clearly deserves a better implementation.
  giftCardSentWebhook: !!enabledWebhooks?.includes("giftCardSentWebhook"),
  invoiceSentWebhook: !!enabledWebhooks?.includes("invoiceSentWebhook"),
  notifyWebhook: !!enabledWebhooks?.includes("notifyWebhook"),
  orderCancelledWebhook: !!enabledWebhooks?.includes("orderCancelledWebhook"),
  orderConfirmedWebhook: !!enabledWebhooks?.includes("orderConfirmedWebhook"),
  orderCreatedWebhook: !!enabledWebhooks?.includes("orderCreatedWebhook"),
  orderFulfilledWebhook: !!enabledWebhooks?.includes("orderFulfilledWebhook"),
  orderFullyPaidWebhook: !!enabledWebhooks?.includes("orderFullyPaidWebhook"),
  orderRefundedWebhook: !!enabledWebhooks?.includes("orderRefundedWebhook"),
});
