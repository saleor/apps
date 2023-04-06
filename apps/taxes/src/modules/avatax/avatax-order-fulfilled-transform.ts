import { OrderFulfilledSubscriptionFragment } from "../../../generated/graphql";
import { EXTERNAL_ID_KEY } from "../../pages/api/webhooks/order-created";
import { CommitTransactionArgs } from "./avatax-client";
import { AvataxConfig } from "./avatax-config";

function getTransactionCodeFromMetadata(
  metadata: OrderFulfilledSubscriptionFragment["privateMetadata"]
) {
  const transactionCode = metadata.find((item) => item.key === EXTERNAL_ID_KEY);
  if (!transactionCode) {
    throw new Error("Transaction code not found");
  }

  return transactionCode.value;
}

const transformPayload = (
  order: OrderFulfilledSubscriptionFragment,
  config: AvataxConfig
): CommitTransactionArgs => {
  const transactionCode = getTransactionCodeFromMetadata(order.privateMetadata);
  return {
    transactionCode,
    companyCode: config.companyCode,
  };
};

export const avataxOrderFulfilled = {
  transformPayload,
};
