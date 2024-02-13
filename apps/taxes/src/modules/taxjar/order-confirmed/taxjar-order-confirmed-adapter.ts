import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";

import { ClientLogger } from "../../logs/client-logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { CreateOrderArgs, TaxJarClient } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderConfirmedPayloadService } from "./taxjar-order-confirmed-payload.service";
import { TaxJarOrderConfirmedResponseTransformer } from "./taxjar-order-confirmed-response-transformer";
import { normalizeTaxJarError } from "../taxjar-error-normalizer";
import { createLogger } from "../../../logger";

export type TaxJarOrderConfirmedPayload = {
  order: OrderConfirmedSubscriptionFragment;
};
export type TaxJarOrderConfirmedTarget = CreateOrderArgs;
export type TaxJarOrderConfirmedResponse = CreateOrderResponse;

export class TaxJarOrderConfirmedAdapter
  implements WebhookAdapter<TaxJarOrderConfirmedPayload, TaxJarOrderConfirmedResponse>
{
  private readonly logger = createLogger("TaxJarOrderConfirmedAdapter");
  private readonly config: TaxJarConfig;
  private readonly authData: AuthData;
  private clientLogger: ClientLogger;

  constructor({
    config,
    authData,
    clientLogger,
  }: {
    config: TaxJarConfig;
    clientLogger: ClientLogger;
    authData: AuthData;
  }) {
    this.config = config;
    this.authData = authData;
    this.clientLogger = clientLogger;
  }

  async send(payload: TaxJarOrderConfirmedPayload): Promise<TaxJarOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with TaxJar...");
    const payloadService = new TaxJarOrderConfirmedPayloadService(this.authData);
    const target = await payloadService.getPayload(payload.order, this.config);

    this.logger.debug("Calling TaxJar fetchTaxForOrder with transformed payload...");

    const client = new TaxJarClient(this.config);

    try {
      const response = await client.createOrder(target);

      this.logger.debug("TaxJar createOrder successfully responded");
      const responseTransformer = new TaxJarOrderConfirmedResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed TaxJar createOrder response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeTaxJarError(e);

      this.clientLogger.push({
        event: "[OrderConfirmed] createOrder",
        status: "error",
        payload: {
          input: target,
          output: error.message,
        },
      });
      throw error;
    }
  }
}
