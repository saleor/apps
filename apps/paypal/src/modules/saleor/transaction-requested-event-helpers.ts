import { BaseError } from "@/lib/errors";

const MissingTransactionError = BaseError.subclass("MissingTransactionError", {
  props: {
    __internalName: "MissingTransactionError",
  },
});

const MissingChannelIdError = BaseError.subclass("MissingChannelIdError", {
  props: {
    __internalName: "MissingChannelIdError",
  },
});

export const getTransactionFromRequestedEventPayload = (event: any) => {
  if (!event.transaction) {
    throw new MissingTransactionError("Transaction not found in event");
  }

  return event.transaction;
};

export const getChannelIdFromRequestedEventPayload = (event: any) => {
  const transaction = getTransactionFromRequestedEventPayload(event);

  const possibleChannelId = transaction.checkout?.channel?.id || transaction.order?.channel?.id;

  if (!possibleChannelId) {
    throw new MissingChannelIdError("Channel ID not found in event Checkout or Order");
  }

  return possibleChannelId;
};
