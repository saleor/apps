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
      service: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;

    this.logger.trace({ taxProviderName }, "Constructing tax provider: ");

    switch (taxProviderName) {
      case "taxjar":
        this.client = new TaxJarWebhookService(providerInstance.config);
        break;

      case "avatax":
        this.client = new AvataxWebhookService(providerInstance.config);
        break;

      default: {
        throw new Error(`Tax provider ${taxProviderName} doesn't match`);
      }
    }
  }

  async calculateTaxes(payload: TaxBaseFragment) {
    this.logger.trace({ payload }, ".calculate called");

    return this.client.calculateTaxes(payload);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    this.logger.trace(".createOrder called");

    return this.client.createOrder(order);
  }

  async fulfillOrder(payload: OrderFulfilledSubscriptionFragment) {
    this.logger.trace(".fulfillOrder called");

    return this.client.fulfillOrder(payload);
  }
}

export function getActiveTaxProvider(
  channelSlug: string | undefined,
  encryptedMetadata: MetadataItem[]
): ActiveTaxProvider {
  if (!channelSlug) {
    throw new Error("Channel slug is missing");
  }

  if (!encryptedMetadata.length) {
    throw new Error("App encryptedMetadata is missing");
  }

  const { providers, channels } = getAppConfig(encryptedMetadata);

  const channelConfig = channels[channelSlug];

  if (!channelConfig) {
    // * will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
    throw new Error(`Channel config not found for channel ${channelSlug}`);
  }

  const providerInstance = providers.find(
    (instance) => instance.id === channelConfig.providerInstanceId
  );

  if (!providerInstance) {
    throw new Error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
  }

  const taxProvider = new ActiveTaxProvider(providerInstance);

  return taxProvider;
}
