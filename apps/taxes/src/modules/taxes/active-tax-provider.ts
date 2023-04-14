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

type ActiveTaxProviderResult = { ok: true; data: ActiveTaxProvider } | { ok: false; error: string };

export function getActiveTaxProvider(
  channelSlug: string | undefined,
  metadata: MetadataItem[]
): ActiveTaxProviderResult {
  const logger = createLogger({ service: "getActiveTaxProvider" });

  if (!channelSlug) {
    logger.error("Channel slug is missing");
    return { error: "Channel slug is missing", ok: false };
  }

  if (!metadata.length) {
    logger.error("App metadata is missing");
    return { error: "App metadata is missing", ok: false };
  }

  const { providers, channels } = getAppConfig(metadata);

  const channelConfig = channels[channelSlug];

  if (!channelConfig) {
    // * will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
    logger.info(`Channel config not found for channel ${channelSlug}`);
    return { error: `Channel config not found for channel ${channelSlug}`, ok: false };
  }

  const providerInstance = providers.find(
    (instance) => instance.id === channelConfig.providerInstanceId
  );

  if (!providerInstance) {
    logger.error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
    return {
      error: `Channel (${channelSlug}) providerInstanceId does not match any providers`,
      ok: false,
    };
  }

  const taxProvider = new ActiveTaxProvider(providerInstance, channelConfig);

  return { data: taxProvider, ok: true };
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
