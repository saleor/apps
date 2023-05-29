import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { AvataxOrderCreatedResponseTransformer } from "./avatax-order-created-response-transformer";
import { AvataxOrderCreatedPayloadTransformer } from "./avatax-order-created-payload-transformer";
import { Logger, createLogger } from "../../../lib/logger";

export type Payload = {
  order: OrderCreatedSubscriptionFragment;
  channelConfig: ChannelConfig;
  config: AvataxConfig;
};
export type Target = CreateTransactionArgs;
type Response = CreateOrderResponse;

export class AvataxOrderCreatedAdapter implements WebhookAdapter<Payload, Response> {
  private logger: Logger;

  constructor(private readonly config: AvataxConfig) {
    this.logger = createLogger({ service: "AvataxOrderCreatedAdapter" });
  }

  async send(payload: Pick<Payload, "channelConfig" | "order">): Promise<Response> {
    this.logger.debug({ payload }, "send called with:");

    const payloadTransformer = new AvataxOrderCreatedPayloadTransformer();
    const target = payloadTransformer.transform({ ...payload, config: this.config });

    const client = new AvataxClient(this.config);
    const response = await client.createTransaction(target);

    this.logger.debug({ response }, "Avatax createTransaction response:");

    const responseTransformer = new AvataxOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed Avatax createTransaction response to:");

    return transformedResponse;
  }
}
