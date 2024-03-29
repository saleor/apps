import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "../../../logger";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../../saleor";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";

type AvataxOrderConfirmedPayload = {
  /**
   * @deprecated use `saleorOrder` instead
   */
  order: DeprecatedOrderConfirmedSubscriptionFragment;
  saleorOrder: SaleorOrder;
};
type AvataxOrderConfirmedResponse = CreateOrderResponse;

export class AvataxOrderConfirmedAdapter
  implements WebhookAdapter<AvataxOrderConfirmedPayload, AvataxOrderConfirmedResponse>
{
  private logger = createLogger("AvataxOrderConfirmedAdapter");

  constructor(private avataxClient: AvataxClient) {}

  async send(
    payload: AvataxOrderConfirmedPayload,
    config: AvataxConfig,
    authData: AuthData,
  ): Promise<AvataxOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with AvaTax...");

    const payloadService = new AvataxOrderConfirmedPayloadService(this.avataxClient);
    const target = await payloadService.getPayload(
      payload.order,
      payload.saleorOrder,
      config,
      authData,
    );

    this.logger.debug("Calling AvaTax createTransaction with transformed payload...");

    try {
      const response = await this.avataxClient.createTransaction(target);

      this.logger.debug("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxOrderConfirmedResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      throw error;
    }
  }
}
