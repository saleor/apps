import { AuthData } from "@saleor/app-sdk/APL";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { createSettingsManager } from "../../lib/metadata";
import { AppConfig } from "./configuration";

export class AppConfigMetadataManager {
  public readonly metadataKey = "app-config-v2";

  constructor(private mm: SettingsManager) {}

  async get(saleorApiUrl?: string) {
    const metadata = await this.mm.get(this.metadataKey, saleorApiUrl);

    return metadata ? AppConfig.parse(metadata) : new AppConfig();
  }

  set(config: AppConfig, saleorApiUrl?: string) {
    return this.mm.set({
      key: this.metadataKey,
      value: config.serialize(),
      domain: saleorApiUrl,
    });
  }

  static createFromAuthData(authData: AuthData): AppConfigMetadataManager {
    const settingsManager = createSettingsManager(
      createGraphQLClient({
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
      }),
      authData.appId,
    );

    return new AppConfigMetadataManager(settingsManager);
  }
}
