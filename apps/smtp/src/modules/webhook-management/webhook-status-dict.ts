import { type AppWebhook } from "./webhook-management-service";

export type WebhookStatuses = Record<AppWebhook, boolean>;

export const webhookStatusesFactory = ({
  enabledWebhooks,
}: {
  enabledWebhooks?: AppWebhook[];
}): WebhookStatuses => ({
  // TODO: This function clearly deserves a better implementation.
  accountChangeEmailRequestedWebhook: !!enabledWebhooks?.includes(
    "accountChangeEmailRequestedWebhook",
  ),
  accountConfirmationRequestedWebhook: !!enabledWebhooks?.includes(
    "accountConfirmationRequestedWebhook",
  ),
  accountDeleteRequestedWebhook: !!enabledWebhooks?.includes("accountDeleteRequestedWebhook"),
  accountEmailChangedWebhook: !!enabledWebhooks?.includes("accountEmailChangedWebhook"),
  accountSetPasswordRequestedWebhook: !!enabledWebhooks?.includes(
    "accountSetPasswordRequestedWebhook",
  ),
  fulfillmentApprovedWebhook: !!enabledWebhooks?.includes("fulfillmentApprovedWebhook"),
  fulfillmentCanceledWebhook: !!enabledWebhooks?.includes("fulfillmentCanceledWebhook"),
  fulfillmentCreatedWebhook: !!enabledWebhooks?.includes("fulfillmentCreatedWebhook"),
  fulfillmentTrackingNumberUpdatedWebhook: !!enabledWebhooks?.includes(
    "fulfillmentTrackingNumberUpdatedWebhook",
  ),
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
