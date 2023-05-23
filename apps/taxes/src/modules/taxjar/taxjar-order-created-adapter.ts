import { OrderCreatedSubscriptionFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { CreateOrderResponse } from "../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../taxes/tax-webhook-adapter";
import { TaxJarOrderCreatedPayloadTransformer } from "./taxjar-order-created-payload-transformer";
import { CreateOrderArgs, TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";

export type Payload = { order: OrderCreatedSubscriptionFragment; channelConfig: ChannelConfig };
export type Target = CreateOrderArgs;
type Response = CreateOrderResponse;

export class TaxJarOrderCreatedAdapter implements WebhookAdapter<Payload, Response> {
  constructor(private readonly config: TaxJarConfig) {}

  async send(payload: Payload): Promise<Response> {
    const payloadTransformer = new TaxJarOrderCreatedPayloadTransformer();
    const target = payloadTransformer.transform(payload);

    const client = new TaxJarClient(this.config);
    const response = await client.createOrder(target);

    const responseTransformer = new TaxJarOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    return transformedResponse;
  }
}
