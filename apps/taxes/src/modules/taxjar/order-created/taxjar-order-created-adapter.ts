import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { TaxJarOrderCreatedPayloadTransformer } from "./taxjar-order-created-payload-transformer";
import { CreateOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-config";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";
import { Logger, createLogger } from "../../../lib/logger";

export type Payload = { order: OrderCreatedSubscriptionFragment; channelConfig: ChannelConfig };
export type Target = CreateOrderArgs;
type Response = CreateOrderResponse;

export class TaxJarOrderCreatedAdapter implements WebhookAdapter<Payload, Response> {
  private logger: Logger;
  constructor(private readonly config: TaxJarConfig) {
    this.logger = createLogger({ service: "TaxJarOrderCreatedAdapter" });
  }

  async send(payload: Payload): Promise<Response> {
    this.logger.debug({ payload }, "send called with:");

    const payloadTransformer = new TaxJarOrderCreatedPayloadTransformer();
    const target = payloadTransformer.transform(payload);

    const client = new TaxJarClient(this.config);
    const response = await client.createOrder(target);

    this.logger.debug({ response }, "TaxJar createOrder response:");

    const responseTransformer = new TaxJarOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed TaxJar createOrder response to:");

    return transformedResponse;
  }
}
