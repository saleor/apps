import {
  MetadataItem,
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";
import { TaxProviderError } from "./tax-provider-error";
import pino from "pino";
import { getAppConfig } from "../app-configuration/get-app-config";

export function getActiveTaxProvider(channelSlug: string | undefined, metadata: MetadataItem[]) {
  const logger = createLogger({ service: "getActiveTaxProvider" });

  if (!channelSlug) {
    logger.error("Channel slug is missing");
    throw new Error("Channel slug is missing");
  }

  const { providers, channels } = getAppConfig(metadata);

  const channelConfig = channels[channelSlug];

  if (!channelConfig) {
    logger.error(`Channel config not found for channel ${channelSlug}`);
    throw new Error(`Channel config not found for channel ${channelSlug}`);
  }

  const providerInstance = providers.find(
    (instance) => instance.id === channelConfig.providerInstanceId
  );

  if (!providerInstance) {
    logger.error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
    throw new Error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
  }

  const taxProvider = new ActiveTaxProvider(providerInstance, channelConfig);

  return taxProvider;
}

export class ActiveTaxProvider implements ProviderWebhookService {
  private client: ProviderWebhookService;
  private logger: pino.Logger;
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
        throw new TaxProviderError(`Tax provider ${taxProviderName} doesn't match`, {
          cause: "TaxProviderNotFound",
        });
      }
    }
  }

  async calculateTaxes(payload: TaxBaseFragment) {
    this.logger.debug({ payload }, ".calculate called");

    return this.client.calculateTaxes(payload, this.channel);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    this.logger.debug(".createOrder called");

    return this.client.createOrder(order, this.channel);
  }

  async fulfillOrder(payload: OrderFulfilledSubscriptionFragment) {
    this.logger.debug(".fulfillOrder called");

    return this.client.fulfillOrder(payload, this.channel);
  }
}
