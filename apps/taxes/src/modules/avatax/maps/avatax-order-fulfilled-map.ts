import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { PROVIDER_ORDER_ID_KEY } from "../../../pages/api/webhooks/order-created";
import { CommitTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";

function getTransactionCodeFromMetadata(
  metadata: OrderFulfilledSubscriptionFragment["privateMetadata"]
) {
  const transactionCode = metadata.find((item) => item.key === PROVIDER_ORDER_ID_KEY);

  if (!transactionCode) {
    throw new Error("Transaction code not found");
  }

  return transactionCode.value;
}

const mapPayload = (
  order: OrderFulfilledSubscriptionFragment,
  config: AvataxConfig
): CommitTransactionArgs => {
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
};
