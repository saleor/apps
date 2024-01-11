import { AuthData } from "@saleor/app-sdk/APL";
import { MetadataItem, OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";

import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { ProviderConnection } from "../provider-connections/provider-connections";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";
import { createClientLogger } from "../logs/client-logger";
import { ExpectedError } from "../../error";
import { createLogger } from "../../logger";

// todo: refactor to a factory
class ActiveTaxProviderService implements ProviderWebhookService {
  private logger = createLogger("ActiveTaxProviderService");
  private client: TaxJarWebhookService | AvataxWebhookService;

  constructor(
    providerConnection: ProviderConnection,
    private authData: AuthData,
  ) {
    const taxProviderName = providerConnection.provider;
    const clientLogger = createClientLogger({
      authData,
      configurationId: providerConnection.id,
    });

    switch (taxProviderName) {
      case "taxjar": {
        this.logger.debug("Selecting TaxJar as tax provider");
        this.client = new TaxJarWebhookService({
          config: providerConnection.config,
          authData: this.authData,
          clientLogger,
        });
        break;
      }

      case "avatax": {
        this.logger.debug("Selecting AvaTax as tax provider");
        this.client = new AvataxWebhookService({
          config: providerConnection.config,
          authData: this.authData,
          clientLogger,
        });
        break;
      }

      default: {
        throw new Error(`Tax provider ${taxProviderName} doesn't match`);
      }
    }
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    return this.client.calculateTaxes(payload);
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    return this.client.confirmOrder(order);
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    this.client.cancelOrder(payload);
  }
}

export function getActiveConnectionService(
  channelSlug: string | undefined,
  encryptedMetadata: MetadataItem[],
  authData: AuthData,
): ActiveTaxProviderService {
  const logger = createLogger("getActiveConnectionService");

  if (!channelSlug) {
    throw new Error("Channel slug was not found in the webhook payload");
  }

  if (!encryptedMetadata.length) {
    throw new Error("App encryptedMetadata was not found in the webhook payload");
  }

  const { providerConnections, channels } = getAppConfig(encryptedMetadata);

  if (!channels.length) {
    throw new Error("You must assign a provider to the channel");
  }

  const channelConfig = channels.find((channel) => channel.config.slug === channelSlug);

  if (!channelConfig) {
    // * will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
    logger.debug("Channel config was not found for channel slug", { channelSlug });
    throw new ExpectedError(`Channel config was not found for channel ${channelSlug}`);
  }

  const providerConnection = providerConnections.find(
    (connection) => connection.id === channelConfig.config.providerConnectionId,
  );

  if (!providerConnection) {
    logger.debug(
      "In the providers array, there is no item with an id that matches the channel config providerConnectionId.",
      { providerConnections, channelConfig },
    );
    throw new ExpectedError(`Channel config providerConnectionId does not match any providers`);
  }

  const taxProvider = new ActiveTaxProviderService(providerConnection, authData);

  return taxProvider;
}
