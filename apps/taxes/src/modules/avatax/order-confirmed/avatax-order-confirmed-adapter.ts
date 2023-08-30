import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";
import { AvataxClientLogger } from "../logger/avatax-client-logger";
import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../../app/metadata-manager";

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

  constructor({ config, authData }: { config: AvataxConfig; authData: AuthData }) {
    this.logger = createLogger({ name: "AvataxOrderConfirmedAdapter" });
    this.config = config;
    this.authData = authData;
    const client = createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const { appId } = authData;
    const settingsManager = createSettingsManager(client, appId);

    this.clientLogger = new AvataxClientLogger({ settingsManager });
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
        event: "createTransaction",
        status: "success",
        payload: JSON.stringify(target),
      });

      this.logger.debug("AvaTax createTransaction successfully responded");

      const responseTransformer = new AvataxOrderConfirmedResponseTransformer();
      const transformedResponse = responseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (error) {
      const payload = error instanceof Error ? error.message : error;

      this.clientLogger.push({
        event: "createTransaction",
        status: "error",
        payload,
      });
      throw error;
    }
  }
}
