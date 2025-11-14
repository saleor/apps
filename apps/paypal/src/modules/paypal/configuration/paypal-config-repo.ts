import { AuthData } from "@saleor/app-sdk/APL";
import { Result, ok, err } from "neverthrow";

import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";
import { paypalConfigCache } from "./paypal-config-cache";
import { createLogger } from "@/lib/logger";

const logger = createLogger("PayPalConfigRepo");

export interface PayPalConfigRepo {
  getPayPalConfig(authData: AuthData, channelId?: string): Promise<Result<PayPalConfig | null, Error>>;
  savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>>;
  deletePayPalConfig(authData: AuthData): Promise<Result<void, Error>>;
}

export class PayPalConfigRepoImpl implements PayPalConfigRepo {
  async getPayPalConfig(authData: AuthData, channelId?: string): Promise<Result<PayPalConfig | null, Error>> {
    const saleorApiUrl = authData.saleorApiUrl;

    // Check cache first
    const cachedConfig = paypalConfigCache.get(saleorApiUrl, channelId);
    if (cachedConfig !== undefined) {
      logger.debug("Returning cached PayPal config", {
        saleor_api_url: saleorApiUrl,
        channel_id: channelId,
        has_config: !!cachedConfig,
      });
      return ok(cachedConfig);
    }

    // Cache miss - fetch from Saleor metadata
    logger.debug("Cache miss - fetching PayPal config from Saleor metadata", {
      saleor_api_url: saleorApiUrl,
      channel_id: channelId,
    });
    const startTime = Date.now();

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
          const fetchTime = Date.now() - startTime;
          logger.debug("PayPal config fetched from Saleor", {
            fetch_time_ms: fetchTime,
            channel_id: channelId,
          });

          // Cache the result
          paypalConfigCache.set(saleorApiUrl, channelConfig, channelId);
          return ok(channelConfig);
        }
      }

      // Fallback: Get first available config (for single-tenant setup or when no channel mapping exists)
      const allConfigsResult = await manager.getAllConfigs();
      if (allConfigsResult.isErr()) {
        return err(allConfigsResult.error);
      }

      const configs = allConfigsResult.value;
      const config = configs.length > 0 ? configs[0] : null;

      const fetchTime = Date.now() - startTime;
      logger.debug("PayPal config fetched from Saleor", {
        fetch_time_ms: fetchTime,
        configs_count: configs.length,
        has_config: !!config,
      });

      // Cache the result
      paypalConfigCache.set(saleorApiUrl, config, channelId);

      return ok(config);
    } catch (error) {
      const fetchTime = Date.now() - startTime;
      logger.error("Failed to get PayPal config from Saleor", {
        error: error instanceof Error ? error.message : String(error),
        fetch_time_ms: fetchTime,
      });
      return err(error instanceof Error ? error : new Error('Failed to get PayPal config'));
    }
  }

  async savePayPalConfig(authData: AuthData, config: PayPalConfig): Promise<Result<void, Error>> {
    const manager = PayPalMultiConfigMetadataManager.createFromAuthData(authData);
    const result = await manager.saveConfig(config);

    if (result.isOk()) {
      // Invalidate all cache entries for this saleorApiUrl since config changed
      paypalConfigCache.invalidateAll(authData.saleorApiUrl);
      logger.info("Cache invalidated due to config save", {
        saleor_api_url: authData.saleorApiUrl,
      });
    }

    return result;
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
      const result = await manager.deleteConfig(configs[0].id);

      if (result.isOk()) {
        // Invalidate all cache entries for this saleorApiUrl since config deleted
        paypalConfigCache.invalidateAll(authData.saleorApiUrl);
        logger.info("Cache invalidated due to config deletion", {
          saleor_api_url: authData.saleorApiUrl,
        });
      }

      return result;
    }

    return ok(undefined);
  }
}

export const paypalConfigRepo = new PayPalConfigRepoImpl();