import { createLogger } from "../../../logger";
import { CancelOrderPayload } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<{ avataxId: string }, void> {
  private logger = createLogger("AvataxOrderCancelledAdapter");

  constructor(private avataxClient: AvataxClient) {}

  async send(payload: CancelOrderPayload, config: AvataxConfig) {
    this.logger.debug("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const payloadTransformer = new AvataxOrderCancelledPayloadTransformer();
    const target = payloadTransformer.transform(
      payload,
      config.companyCode ?? defaultAvataxConfig.companyCode,
    );

    this.logger.debug("Calling AvaTax voidTransaction with transformed payload...");

    try {
      await this.avataxClient.voidTransaction(target);

      this.logger.debug(`Successfully voided the transaction of id: ${target.transactionCode}`);
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      throw error;
    }
  }
}
