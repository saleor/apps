import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
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

  constructor(private readonly config: AvataxConfig, private authData: AuthData) {
    this.logger = createLogger({ name: "AvataxOrderConfirmedAdapter" });
  }

  async send(payload: AvataxOrderConfirmedPayload): Promise<AvataxOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with Avatax...");

    const payloadService = new AvataxOrderConfirmedPayloadService(this.authData);
    const target = await payloadService.getPayload(payload.order, this.config);

    this.logger.debug("Calling Avatax createTransaction with transformed payload...");

    const client = new AvataxClient(this.config);
    const response = await client.createTransaction(target);

    this.logger.debug("Avatax createTransaction successfully responded");

    const responseTransformer = new AvataxOrderConfirmedResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug("Transformed Avatax createTransaction response");

    return transformedResponse;
  }
}
