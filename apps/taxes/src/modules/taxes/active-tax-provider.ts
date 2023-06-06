import {
  MetadataItem,
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";

import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";

// todo: refactor to a factory
export class ActiveTaxProvider implements ProviderWebhookService {
  private logger: Logger;
  private client: TaxJarWebhookService | AvataxWebhookService;

  constructor(providerInstance: ProviderConfig) {
    this.logger = createLogger({
      location: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;

    switch (taxProviderName) {
      case "taxjar": {
        this.logger.debug("Selecting TaxJar as tax provider");
        this.client = new TaxJarWebhookService(providerInstance.config);
        break;
      }

      case "avatax": {
        this.logger.debug("Selecting Avatax as tax provider");
        this.client = new AvataxWebhookService(providerInstance.config);
        break;
      }

      default: {
        throw new Error(`Tax provider ${taxProviderName} doesn't match`);
      }
    }
  }

  async calculateTaxes(payload: TaxBaseFragment) {
    return this.client.calculateTaxes(payload);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    return this.client.createOrder(order);
  }

  async fulfillOrder(payload: OrderFulfilledSubscriptionFragment) {
    return this.client.fulfillOrder(payload);
  }
}

export function getActiveTaxProvider(
  channelSlug: string | undefined,
  encryptedMetadata: MetadataItem[]
): ActiveTaxProvider {
  const logger = createLogger({
    location: "getActiveTaxProvider",
  });

  if (!channelSlug) {
    throw new Error("Channel slug was not found in the webhook payload");
  }

  if (!encryptedMetadata.length) {
    throw new Error("App encryptedMetadata was not found in the webhook payload");
  }

  const { providers, channels } = getAppConfig(encryptedMetadata);

  const channelConfig = channels.find((channel) => channel.config.slug === channelSlug);

  if (!channelConfig) {
    // * will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
    logger.debug({ channelSlug, channelConfig }, "Channel config was not found for channel slug");
    throw new Error(`Channel config was not found for channel ${channelSlug}`);
  }

  const providerInstance = providers.find(
    (instance) => instance.id === channelConfig.config.providerInstanceId
  );

  if (!providerInstance) {
    logger.debug(
      { providers, channelConfig },
      "In the providers array, there is no item with an id that matches the channel config providerInstanceId."
    );
    throw new Error(`Channel config providerInstanceId does not match any providers`);
  }

  const taxProvider = new ActiveTaxProvider(providerInstance);

  return taxProvider;
}
