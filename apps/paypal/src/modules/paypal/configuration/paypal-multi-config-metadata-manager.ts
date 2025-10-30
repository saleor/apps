import { AuthData } from "@saleor/app-sdk/APL";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { Result, ok, err } from "neverthrow";

import { createSettingsManager } from "@/lib/metadata-manager";
import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { PayPalAppRootConfig } from "./paypal-app-root-config";
import { createPayPalClientId } from "@/modules/paypal/paypal-client-id";
import { createPayPalClientSecret } from "@/modules/paypal/paypal-client-secret";

export class PayPalMultiConfigMetadataManager {
  private readonly configsMetadataKey = "paypal-configs-v2";
  private readonly mappingMetadataKey = "paypal-channel-mapping-v2";
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  async getRootConfig(): Promise<Result<PayPalAppRootConfig, Error>> {
    try {
      // Get all configurations
      const configsResult = await this.getAllConfigs();
      if (configsResult.isErr()) {
        return err(configsResult.error);
      }

      // Get channel mappings
      const mappingResult = await this.getChannelMapping();
      if (mappingResult.isErr()) {
        return err(mappingResult.error);
      }

      // Convert configs array to indexed object
      const paypalConfigsById: Record<string, PayPalConfig> = {};
      configsResult.value.forEach(config => {
        paypalConfigsById[config.id] = config;
      });

      return ok(new PayPalAppRootConfig(mappingResult.value, paypalConfigsById));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get root config'));
    }
  }

  async getAllConfigs(): Promise<Result<PayPalConfig[], Error>> {
    try {
      const metadata = await this.settingsManager.get(this.configsMetadataKey);
      
      if (!metadata) {
        return ok([]);
      }

      const configsData = JSON.parse(metadata);
      const configs: PayPalConfig[] = [];

      for (const configData of configsData) {
        const paypalConfigResult = PayPalConfig.create({
          id: configData.id,
          name: configData.name,
          clientId: createPayPalClientId(configData.clientId),
          clientSecret: createPayPalClientSecret(configData.clientSecret),
          environment: configData.environment,
          merchantClientId: configData.merchantClientId,
          merchantEmail: configData.merchantEmail,
          merchantId: configData.merchantId,
        });

        if (paypalConfigResult.isErr()) {
          return err(new Error(`Failed to parse PayPal config ${configData.id}: ${paypalConfigResult.error.message}`));
        }

        configs.push(paypalConfigResult.value);
      }

      return ok(configs);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get PayPal configs'));
    }
  }

  async getConfigById(configId: string): Promise<Result<PayPalConfig | null, Error>> {
    const allConfigsResult = await this.getAllConfigs();
    if (allConfigsResult.isErr()) {
      return err(allConfigsResult.error);
    }

    const config = allConfigsResult.value.find(c => c.id === configId);
    return ok(config || null);
  }

  async saveConfig(config: PayPalConfig): Promise<Result<void, Error>> {
    try {
      const allConfigsResult = await this.getAllConfigs();
      if (allConfigsResult.isErr()) {
        return err(allConfigsResult.error);
      }

      const configs = allConfigsResult.value;
      const existingIndex = configs.findIndex(c => c.id === config.id);

      if (existingIndex >= 0) {
        // Update existing config
        configs[existingIndex] = config;
      } else {
        // Add new config
        configs.push(config);
      }

      const configsData = configs.map(c => ({
        id: c.id,
        name: c.name,
        clientId: c.clientId,
        clientSecret: c.clientSecret,
        environment: c.environment,
        merchantClientId: c.merchantClientId,
        merchantEmail: c.merchantEmail,
        merchantId: c.merchantId,
      }));

      await this.settingsManager.set({
        key: this.configsMetadataKey,
        value: JSON.stringify(configsData),
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to save PayPal config'));
    }
  }

  async deleteConfig(configId: string): Promise<Result<void, Error>> {
    try {
      const allConfigsResult = await this.getAllConfigs();
      if (allConfigsResult.isErr()) {
        return err(allConfigsResult.error);
      }

      const filteredConfigs = allConfigsResult.value.filter(c => c.id !== configId);

      const configsData = filteredConfigs.map(c => ({
        id: c.id,
        name: c.name,
        clientId: c.clientId,
        clientSecret: c.clientSecret,
        environment: c.environment,
        merchantClientId: c.merchantClientId,
        merchantEmail: c.merchantEmail,
        merchantId: c.merchantId,
      }));

      await this.settingsManager.set({
        key: this.configsMetadataKey,
        value: JSON.stringify(configsData),
      });

      // Also remove any channel mappings for this config
      const mappingResult = await this.getChannelMapping();
      if (mappingResult.isOk()) {
        const mapping = mappingResult.value;
        const updatedMapping: Record<string, string> = {};
        
        Object.entries(mapping).forEach(([channelId, mappedConfigId]) => {
          if (mappedConfigId !== configId) {
            updatedMapping[channelId] = mappedConfigId;
          }
        });

        await this.setChannelMapping(updatedMapping);
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete PayPal config'));
    }
  }

  async getChannelMapping(): Promise<Result<Record<string, string>, Error>> {
    try {
      const metadata = await this.settingsManager.get(this.mappingMetadataKey);
      
      if (!metadata) {
        return ok({});
      }

      return ok(JSON.parse(metadata));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get channel mapping'));
    }
  }

  async setChannelMapping(mapping: Record<string, string>): Promise<Result<void, Error>> {
    try {
      await this.settingsManager.set({
        key: this.mappingMetadataKey,
        value: JSON.stringify(mapping),
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to set channel mapping'));
    }
  }

  async updateChannelMapping(channelId: string, configId: string | null): Promise<Result<void, Error>> {
    try {
      const mappingResult = await this.getChannelMapping();
      if (mappingResult.isErr()) {
        return err(mappingResult.error);
      }

      const mapping = mappingResult.value;

      if (configId === null) {
        // Remove mapping
        delete mapping[channelId];
      } else {
        // Set mapping
        mapping[channelId] = configId;
      }

      return this.setChannelMapping(mapping);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update channel mapping'));
    }
  }

  static createFromAuthData(authData: AuthData): PayPalMultiConfigMetadataManager {
    const settingsManager = createSettingsManager(
      createGraphQLClient({
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
      }),
      authData.appId,
    );

    return new PayPalMultiConfigMetadataManager(settingsManager);
  }
}