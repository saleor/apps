import {
  type TransactionCancelationRequestedEventFragment,
  type TransactionChargeRequestedEventFragment,
  type TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("transaction-requested-event-helpers");

const MissingTransactionError = BaseError.subclass("MissingTransactionError", {
  props: {
    _internalName: "MissingTransactionError" as const,
  },
});

const MissingChannelIdError = BaseError.subclass("MissingChannelIdError", {
  props: {
    _internalName: "MissingChannelIdError" as const,
  },
});

/**
 * Additional helper as Saleor Graphql schema doesn't require transaction and it is needed to process the event
 */
export const getTransactionFromRequestedEventPayload = (
  event:
    | TransactionRefundRequestedEventFragment
    | TransactionChargeRequestedEventFragment
    | TransactionCancelationRequestedEventFragment,
) => {
  if (!event.transaction) {
    throw new MissingTransactionError("Transaction not found in event");
  }

  return event.transaction;
};

/**
 *
 * Additional helper as Saleor Graphql schema doesn't require Order / Channel and it is needed to process the event
 */
export const getChannelIdFromRequestedEventPayload = (
  event:
    | TransactionRefundRequestedEventFragment
    | TransactionChargeRequestedEventFragment
    | TransactionCancelationRequestedEventFragment,
) => {
  const transaction = getTransactionFromRequestedEventPayload(event);

  const possibleChannelId = transaction.checkout?.channel?.id || transaction.order?.channel?.id;

  if (!possibleChannelId) {
    throw new MissingChannelIdError("Channel ID not found in event Checkout or Order");
  }

  return possibleChannelId;
};

/**
 * Saleor sends `idempotencyKey` on transaction action requested events since 3.23. It is stable
 * across Saleor's delivery retries of the same request, so passing it to Stripe prevents the action
 * from being performed twice.
 *
 * Installations that didn't migrate their webhook subscription query yet don't send it. In that case
 * Stripe SDK generates its own key, which only covers retries within a single request - the
 * pre-3.23 behavior.
 */
export const getIdempotencyKeyFromRequestedEventPayload = (
  event:
    | TransactionRefundRequestedEventFragment
    | TransactionChargeRequestedEventFragment
    | TransactionCancelationRequestedEventFragment,
): string | undefined => {
  if (!event.idempotencyKey) {
    logger.warn(
      "Event has no idempotencyKey, Stripe action can't be deduplicated across Saleor delivery retries. Webhook subscription query is outdated - run webhooks migration",
    );

    return undefined;
  }

  return event.idempotencyKey;
};
