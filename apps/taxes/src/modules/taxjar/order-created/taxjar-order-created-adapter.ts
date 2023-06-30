import { AuthData } from "@saleor/app-sdk/APL";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CreateOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderCreatedPayloadService } from "./taxjar-order-created-payload.service";
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
  constructor(private readonly config: TaxJarConfig, private authData: AuthData) {
    this.logger = createLogger({ name: "TaxJarOrderCreatedAdapter" });
  }

  async send(payload: TaxJarOrderCreatedPayload): Promise<TaxJarOrderCreatedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with TaxJar...");
    const payloadService = new TaxJarOrderCreatedPayloadService(this.authData);
    const target = await payloadService.getPayload(payload.order, this.config);

    this.logger.debug("Calling TaxJar fetchTaxForOrder with transformed payload...");

    const client = new TaxJarClient(this.config);
    const response = await client.createOrder(target);

    this.logger.debug("TaxJar createOrder successfully responded");
    const responseTransformer = new TaxJarOrderCreatedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug("Transformed TaxJar createOrder response");

    return transformedResponse;
  }
}
