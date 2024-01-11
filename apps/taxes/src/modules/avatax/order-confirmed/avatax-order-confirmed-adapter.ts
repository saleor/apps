import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { ClientLogger } from "../../logs/client-logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";
import { createLogger } from "../../../logger";

type AvataxOrderConfirmedPayload = {
  order: OrderConfirmedSubscriptionFragment;
};
type AvataxOrderConfirmedResponse = CreateOrderResponse;

export class AvataxOrderConfirmedAdapter
  implements WebhookAdapter<AvataxOrderConfirmedPayload, AvataxOrderConfirmedResponse>
{
  private logger = createLogger("AvataxOrderConfirmedAdapter");
  private readonly config: AvataxConfig;
  private readonly authData: AuthData;
  private readonly clientLogger: ClientLogger;

  constructor({
    config,
    authData,
    clientLogger,
  }: {
    config: AvataxConfig;
    clientLogger: ClientLogger;
    authData: AuthData;
  }) {
    this.config = config;
    this.authData = authData;
    this.clientLogger = clientLogger;
  }

  async send(payload: AvataxOrderConfirmedPayload): Promise<AvataxOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with AvaTax...");

    const payloadService = new AvataxOrderConfirmedPayloadService(this.authData);
    const target = await payloadService.getPayload(payload.order, this.config);

    this.logger.debug("Calling AvaTax createTransaction with transformed payload...");

    const client = new AvataxClient(this.config);

    try {
      const response = await client.createTransaction(target);

      this.logger.debug("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxOrderConfirmedResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      this.clientLogger.push({
        event: "[OrderConfirmed] createTransaction",
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
