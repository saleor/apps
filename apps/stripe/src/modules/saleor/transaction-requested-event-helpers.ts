import {
  TransactionCancelationRequestedEventFragment,
  TransactionChargeRequestedEventFragment,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { BaseError } from "@/lib/errors";

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
