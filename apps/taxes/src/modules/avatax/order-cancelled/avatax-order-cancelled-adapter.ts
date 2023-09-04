import { Logger, createLogger } from "../../../lib/logger";
import { OrderCancelledPayload } from "../../../pages/api/webhooks/order-cancelled";
import { WebhookAdapter, WebhookAdapterParams } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import {
  AvataxClientLogger,
  createAvataxClientLoggerFromAdapter,
} from "../logs/avatax-client-logger";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<OrderCancelledPayload, void> {
  private logger: Logger;
  private readonly clientLogger: AvataxClientLogger;
  private readonly config: AvataxConfig;

  constructor({
    config,
    authData,
    configurationId,
  }: {
    config: AvataxConfig;
  } & WebhookAdapterParams) {
    this.logger = createLogger({ name: "AvataxOrderCancelledAdapter" });
    this.config = config;
    this.clientLogger = createAvataxClientLoggerFromAdapter({ authData, configurationId });
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

      this.logger.debug(`Succesfully voided the transaction of id: ${target.transactionCode}`);
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
