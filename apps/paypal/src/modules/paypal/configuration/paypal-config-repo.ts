import { AuthData } from "@saleor/app-sdk/APL";
import { Result, ok, err } from "neverthrow";

import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

export interface PayPalConfigRepo {
  getPayPalConfig(authData: AuthData, channelId?: string): Promise<Result<PayPalConfig | null, Error>>;
  savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>>;
  deletePayPalConfig(authData: AuthData): Promise<Result<void, Error>>;
}

export class PayPalConfigRepoImpl implements PayPalConfigRepo {
  async getPayPalConfig(authData: AuthData, channelId?: string): Promise<Result<PayPalConfig | null, Error>> {
    try {
      const manager = PayPalMultiConfigMetadataManager.createFromAuthData(authData);
      const rootConfigResult = await manager.getRootConfig();

      if (rootConfigResult.isErr()) {
        return err(rootConfigResult.error);
      }

      const rootConfig = rootConfigResult.value;

      // If channel ID is provided, try to get config for that specific channel
      if (channelId) {
        const channelConfig = rootConfig.getConfigForChannel(channelId);
        if (channelConfig) {
          return ok(channelConfig);
        }
      }

      // Fallback: Get first available config (for single-tenant setup or when no channel mapping exists)
      const allConfigsResult = await manager.getAllConfigs();
      if (allConfigsResult.isErr()) {
        return err(allConfigsResult.error);
      }

      const configs = allConfigsResult.value;
      if (configs.length > 0) {
        return ok(configs[0]);
      }

      return ok(null);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get PayPal config'));
    }
  }

  async savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>> {
    const manager = PayPalMultiConfigMetadataManager.createFromAuthData(authData);
    return manager.saveConfig(config);
  }

  async deletePayPalConfig(authData: AuthData): Promise<Result<void, Error>> {
    // For backward compatibility, delete the first config
    const manager = PayPalMultiConfigMetadataManager.createFromAuthData(authData);
    const allConfigsResult = await manager.getAllConfigs();

    if (allConfigsResult.isErr()) {
      return err(allConfigsResult.error);
    }

    const configs = allConfigsResult.value;
    if (configs.length > 0) {
      return manager.deleteConfig(configs[0].id);
    }

    return ok(undefined);
  }
}

export const paypalConfigRepo = new PayPalConfigRepoImpl();