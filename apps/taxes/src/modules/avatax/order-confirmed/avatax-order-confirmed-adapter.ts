import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxClientLogger } from "../logs/avatax-client-logger";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";

type AvataxOrderConfirmedPayload = {
  order: OrderConfirmedSubscriptionFragment;
};
type AvataxOrderConfirmedResponse = CreateOrderResponse;

export class AvataxOrderConfirmedAdapter
  implements WebhookAdapter<AvataxOrderConfirmedPayload, AvataxOrderConfirmedResponse>
{
  private logger: Logger;
  private readonly config: AvataxConfig;
  private readonly authData: AuthData;
  private readonly clientLogger: AvataxClientLogger;

  constructor({
    config,
    authData,
    clientLogger,
  }: {
    config: AvataxConfig;
    clientLogger: AvataxClientLogger;
    authData: AuthData;
  }) {
    this.logger = createLogger({ name: "AvataxOrderConfirmedAdapter" });
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

      this.clientLogger.push({
        event: "[OrderConfirmed] createTransaction",
        status: "success",
        payload: {
          input: target,
          output: response,
        },
      });

      this.logger.debug("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxOrderConfirmedResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (error) {
      this.clientLogger.push({
        event: "[OrderConfirmed] createTransaction",
        status: "error",
        payload: {
          input: target,
          output: error,
        },
      });
      throw error;
    }
  }
}
