import { Logger, createLogger } from "../../../lib/logger";
import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { ClientLogger } from "../../logs/client-logger";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<OrderCancelledPayload, void> {
  private logger: Logger;
  private readonly clientLogger: ClientLogger;
  private readonly config: AvataxConfig;

  constructor({ config, clientLogger }: { config: AvataxConfig; clientLogger: ClientLogger }) {
    this.logger = createLogger({ name: "AvataxOrderCancelledAdapter" });
    this.config = config;
    this.clientLogger = clientLogger;
  }

  async send(payload: OrderCancelledPayload) {
    this.logger.debug("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const payloadTransformer = new AvataxOrderCancelledPayloadTransformer(this.config);
    const target = payloadTransformer.transform({ ...payload });

    this.logger.debug("Calling AvaTax voidTransaction with transformed payload...");

    const client = new AvataxClient(this.config);

    try {
      const response = await client.voidTransaction(target);

      this.clientLogger.push({
        event: "[OrderCancelled] voidTransaction",
        status: "success",
        payload: {
          input: target,
          output: response,
        },
      });

      this.logger.debug(`Successfully voided the transaction of id: ${target.transactionCode}`);
    } catch (error) {
      this.clientLogger.push({
        event: "[OrderCancelled] voidTransaction",
        status: "error",
        payload: {
          input: target,
          output: error,
        },
      });
    }
  }
}
