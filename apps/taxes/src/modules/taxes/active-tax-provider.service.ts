import { MetadataItem } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { getAppConfig } from "../app-configuration/get-app-config";
import { ActiveTaxProvider } from "./active-tax-provider";

export class ActiveTaxProviderService {
  async get(channelSlug: string | undefined, metadata: MetadataItem[]) {
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
}
