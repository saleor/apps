import { createLogger } from "../../../logger";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { OrderCancelledPayload } from "../../webhooks/payloads/order-cancelled-payload";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AuthData } from "@saleor/app-sdk/APL";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<OrderCancelledPayload, void> {
  private logger = createLogger("AvataxOrderCancelledAdapter");

  constructor(private avataxClient: AvataxClient) {}

  async send(payload: OrderCancelledPayload, config: AvataxConfig, authData: AuthData) {
    this.logger.debug("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const payloadTransformer = new AvataxOrderCancelledPayloadTransformer();
    const target = payloadTransformer.transform(
      { ...payload },
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
