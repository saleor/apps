import {
  MetadataItem,
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";

import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";

// todo: refactor to a factory
export class ActiveTaxProvider implements ProviderWebhookService {
  private client: ProviderWebhookService;
  private logger: Logger;
  private channel: ChannelConfig;

  constructor(providerInstance: ProviderConfig, channelConfig: ChannelConfig) {
    this.logger = createLogger({
      service: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;

    this.logger.trace({ taxProviderName }, "Constructing tax provider: ");
    this.channel = channelConfig;

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

    return this.client.calculateTaxes(payload, this.channel);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    this.logger.trace(".createOrder called");

    return this.client.createOrder(order, this.channel);
  }

  async fulfillOrder(payload: OrderFulfilledSubscriptionFragment) {
    this.logger.trace(".fulfillOrder called");

    return this.client.fulfillOrder(payload, this.channel);
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

  const taxProvider = new ActiveTaxProvider(providerInstance, channelConfig);

  return taxProvider;
}
