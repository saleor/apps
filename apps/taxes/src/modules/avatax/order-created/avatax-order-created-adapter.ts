import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { AvataxOrderCreatedPayloadTransformer } from "./avatax-order-created-payload-transformer";
import { AvataxOrderCreatedResponseTransformer } from "./avatax-order-created-response-transformer";

type AvataxOrderCreatedPayload = {
  order: OrderCreatedSubscriptionFragment;
};
type AvataxOrderCreatedResponse = CreateOrderResponse;

export class AvataxOrderCreatedAdapter
  implements WebhookAdapter<AvataxOrderCreatedPayload, AvataxOrderCreatedResponse>
{
  private logger: Logger;

  constructor(private readonly config: AvataxConfig) {
    this.logger = createLogger({ service: "AvataxOrderCreatedAdapter" });
  }

  async send(payload: AvataxOrderCreatedPayload): Promise<AvataxOrderCreatedResponse> {
    this.logger.debug({ payload }, "send called with:");

    const payloadTransformer = new AvataxOrderCreatedPayloadTransformer(this.config);
    const target = payloadTransformer.transform(payload);

    const client = new AvataxClient(this.config);
    const response = await client.createTransaction(target);

    this.logger.debug({ response }, "Avatax createTransaction response:");

    const responseTransformer = new AvataxOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed Avatax createTransaction response to:");

    return transformedResponse;
  }
}
