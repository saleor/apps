import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { Payload, Target } from "./avatax-order-fulfilled-adapter";

// * This is the key that we use to store the provider order id in the Saleor order metadata.

export const PROVIDER_ORDER_ID_KEY = "externalId";

export function getTransactionCodeFromMetadata(
  metadata: OrderFulfilledSubscriptionFragment["privateMetadata"]
) {
  const transactionCode = metadata.find((item) => item.key === PROVIDER_ORDER_ID_KEY);

  if (!transactionCode) {
    throw new Error("Transaction code not found");
  }

  return transactionCode.value;
}

export class AvataxOrderFulfilledPayloadTransformer {
  transform({ order, config }: Payload): Target {
    const transactionCode = getTransactionCodeFromMetadata(order.privateMetadata);

    return {
      transactionCode,
      companyCode: config.companyCode ?? "",
      documentType: DocumentType.SalesInvoice,
      model: {
        commit: true,
      },
    };
  }
}
