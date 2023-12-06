import { Logger, createLogger } from "../../../lib/logger";
import { TransactionRefundRequestedPayload } from "../../../pages/api/webhooks/transaction-refund-requested";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTransactionRefundRequestedPayloadTransformer } from "./avatax-transaction-refund-requested-payload-transformer";

export class AvataxTransactionRefundRequestedAdapter
  implements WebhookAdapter<TransactionRefundRequestedPayload, void>
{
  private logger: Logger;

  constructor(private readonly config: AvataxConfig) {
    this.logger = createLogger({ name: "AvataxTransactionRefundRequestedAdapter" });
  }

  async send(payload: TransactionRefundRequestedPayload) {
    this.logger.debug(
      { payload },
      "Transforming the Saleor payload for refunding order with AvaTax...",
    );

    if (!this.config.isAutocommit) {
      throw new Error(
        "Unable to refund transaction. AvaTax can only refund committed transactions.",
      );
    }

    const client = new AvataxClient(this.config);
    const payloadTransformer = new AvataxTransactionRefundRequestedPayloadTransformer();
    const target = payloadTransformer.transform(payload, this.config);

    this.logger.debug(
      {
        target,
      },
      `Refunding the transaction...`,
    );

    const response = await client.refundTransaction(target);

    this.logger.debug({ response }, `Successfully refunded the transaction`);
  }
}
