import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CreateOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-config";
import { TaxJarOrderCreatedPayloadTransformer } from "./taxjar-order-created-payload-transformer";
import { TaxJarOrderCreatedResponseTransformer } from "./taxjar-order-created-response-transformer";

export type TaxJarOrderCreatedPayload = {
  order: OrderCreatedSubscriptionFragment;
};
export type TaxJarOrderCreatedTarget = CreateOrderArgs;
export type TaxJarOrderCreatedResponse = CreateOrderResponse;

export class TaxJarOrderCreatedAdapter
  implements WebhookAdapter<TaxJarOrderCreatedPayload, TaxJarOrderCreatedResponse>
{
  private logger: Logger;
  constructor(private readonly config: TaxJarConfig) {
    this.logger = createLogger({ location: "TaxJarOrderCreatedAdapter" });
  }

  async send(payload: TaxJarOrderCreatedPayload): Promise<TaxJarOrderCreatedResponse> {
    this.logger.debug({ payload }, "Transforming the following Saleor payload:");
    const payloadTransformer = new TaxJarOrderCreatedPayloadTransformer(this.config);
    const target = payloadTransformer.transform(payload);

    this.logger.debug(
      { transformedPayload: target },
      "Will call TaxJar fetchTaxForOrder with transformed payload:"
    );

    const client = new TaxJarClient(this.config);
    const response = await client.createOrder(target);

    this.logger.debug({ response }, "TaxJar createOrder responded with:");
    const responseTransformer = new TaxJarOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed TaxJar createOrder response to:");

    return transformedResponse;
  }
}
