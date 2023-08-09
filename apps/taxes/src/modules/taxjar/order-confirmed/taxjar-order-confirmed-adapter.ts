import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CreateOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderConfirmedPayloadService } from "./taxjar-order-confirmed-payload.service";
import { TaxJarOrderConfirmedResponseTransformer } from "./taxjar-order-confirmed-response-transformer";

export type TaxJarOrderConfirmedPayload = {
  order: OrderConfirmedSubscriptionFragment;
};
export type TaxJarOrderConfirmedTarget = CreateOrderArgs;
export type TaxJarOrderConfirmedResponse = CreateOrderResponse;

export class TaxJarOrderConfirmedAdapter
  implements WebhookAdapter<TaxJarOrderConfirmedPayload, TaxJarOrderConfirmedResponse>
{
  private logger: Logger;
  constructor(private readonly config: TaxJarConfig, private authData: AuthData) {
    this.logger = createLogger({ name: "TaxJarOrderConfirmedAdapter" });
  }

  async send(payload: TaxJarOrderConfirmedPayload): Promise<TaxJarOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with TaxJar...");
    const payloadService = new TaxJarOrderConfirmedPayloadService(this.authData);
    const target = await payloadService.getPayload(payload.order, this.config);

    this.logger.debug("Calling TaxJar fetchTaxForOrder with transformed payload...");

    const client = new TaxJarClient(this.config);
    const response = await client.createOrder(target);

    this.logger.debug("TaxJar createOrder successfully responded");
    const responseTransformer = new TaxJarOrderConfirmedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug("Transformed TaxJar createOrder response");

    return transformedResponse;
  }
}
