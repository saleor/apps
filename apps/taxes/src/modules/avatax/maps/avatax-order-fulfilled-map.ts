import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";

import { CommitTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";

// * This is the key that we use to store the provider order id in the Saleor order metadata.
export const PROVIDER_ORDER_ID_KEY = "externalId";

function getTransactionCodeFromMetadata(
  metadata: OrderFulfilledSubscriptionFragment["privateMetadata"]
) {
  const transactionCode = metadata.find((item) => item.key === PROVIDER_ORDER_ID_KEY);

  if (!transactionCode) {
    throw new Error("Transaction code not found");
  }

  return transactionCode.value;
}

export type CommitTransactionMapPayloadArgs = {
  order: OrderFulfilledSubscriptionFragment;
  config: AvataxConfig;
};

const mapPayload = ({ order, config }: CommitTransactionMapPayloadArgs): CommitTransactionArgs => {
  const transactionCode = getTransactionCodeFromMetadata(order.privateMetadata);

  return {
    transactionCode,
    companyCode: config.companyCode,
    documentType: DocumentType.SalesInvoice,
    model: {
      commit: true,
    },
  };
};

export const avataxOrderFulfilledMaps = {
  mapPayload,
  getTransactionCodeFromMetadata,
  providerOrderIdKey: PROVIDER_ORDER_ID_KEY,
};
