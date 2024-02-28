import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { ClientLogger } from "../../logs/client-logger";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";
import { createLogger } from "../../../logger";
import { AuthData } from "@saleor/app-sdk/APL";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<OrderCancelledPayload, void> {
  private logger = createLogger("AvataxOrderCancelledAdapter");
  private readonly clientLogger: ClientLogger;

  constructor({ clientLogger }: { clientLogger: ClientLogger }) {
    this.clientLogger = clientLogger;
  }

  async send({
    payload,
    authData,
    config,
  }: {
    payload: OrderCancelledPayload;
    config: AvataxConfig;
    authData: AuthData;
  }) {
    this.logger.debug("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const payloadTransformer = new AvataxOrderCancelledPayloadTransformer(config);
    const target = payloadTransformer.transform({ ...payload });

    this.logger.debug("Calling AvaTax voidTransaction with transformed payload...");

    const client = new AvataxClient(config);

    try {
      await client.voidTransaction(target);

      this.logger.debug(`Successfully voided the transaction of id: ${target.transactionCode}`);
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      this.clientLogger.push({
        event: "[OrderCancelled] voidTransaction",
        status: "error",
        payload: {
          input: target,
          output: error.message,
        },
      });

      throw error;
    }
  }
}
