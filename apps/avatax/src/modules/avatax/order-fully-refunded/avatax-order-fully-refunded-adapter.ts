import { createLogger } from "../../../logger";
import { OrderFullyRefundedPayload } from "../../../pages/api/webhooks/order-fully-refunded";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderRefundedPayloadTransformer } from "./avatax-order-fully-refunded-payload-transformer";

export class AvataxOrderFullyRefundedAdapter
  implements WebhookAdapter<OrderFullyRefundedPayload, void>
{
  private logger = createLogger("AvataxOrderFullyRefundedAdapter");

  constructor(private readonly config: AvataxConfig) {}

  async send(payload: OrderFullyRefundedPayload) {
    this.logger.debug("Transforming the Saleor payload for refunding order with AvaTax...", {
      payload,
    });

    const client = new AvataxClient(this.config);
    const payloadTransformer = new AvataxOrderRefundedPayloadTransformer();
    const target = payloadTransformer.transform(payload, this.config);

    this.logger.debug(`Refunding the transaction...`, {
      target,
    });

    const response = await client.fullyRefundTransaction(target);

    this.logger.debug(`Successfully refunded the transaction`, { response });
  }
}
