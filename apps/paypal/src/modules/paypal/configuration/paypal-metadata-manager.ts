import { AuthData } from "@saleor/app-sdk/APL";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { Result, ok, err } from "neverthrow";

import { createSettingsManager } from "@/lib/metadata-manager";
import { PayPalConfig } from "./paypal-config";

export class PayPalMetadataManager {
  public readonly metadataKey = "paypal-config-v1";
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  async get(): Promise<Result<PayPalConfig | null, Error>> {
    try {
      const metadata = await this.settingsManager.get(this.metadataKey);
      
      if (!metadata) {
        return ok(null);
      }

      const configData = JSON.parse(metadata);
      const paypalConfig = PayPalConfig.create({
        id: configData.id || "default",
        name: configData.name || "PayPal Configuration",
        clientId: configData.clientId,
        clientSecret: configData.clientSecret,
        environment: configData.environment,
      });

      if (paypalConfig.isErr()) {
        return err(new Error(`Failed to parse PayPal config: ${paypalConfig.error.message}`));
      }

      return ok(paypalConfig.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get PayPal config'));
    }
  }

  async set(config: PayPalConfig): Promise<Result<void, Error>> {
    try {
      const configData = {
        id: config.id,
        name: config.name,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        environment: config.environment,
      };

      await this.settingsManager.set({
        key: this.metadataKey,
        value: JSON.stringify(configData),
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to set PayPal config'));
    }
  }

  async delete(): Promise<Result<void, Error>> {
    try {
      await this.settingsManager.delete(this.metadataKey);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete PayPal config'));
    }
  }

  static createFromAuthData(authData: AuthData): PayPalMetadataManager {
    const settingsManager = createSettingsManager(
      createGraphQLClient({
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
      }),
      authData.appId,
    );

    return new PayPalMetadataManager(settingsManager);
  }
}