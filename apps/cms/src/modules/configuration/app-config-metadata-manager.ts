import { type AuthData } from "@saleor/app-sdk/APL";
import { type SettingsManager } from "@saleor/app-sdk/settings-manager";

import { ENCRYPTED_METADATA_KEYS } from "../../lib/encrypted-metadata-keys";
import { createInstrumentedGraphqlClient } from "../trpc/create-instrumented-graphql-client";
import { AppConfig } from "./app-config";
import { createSettingsManager } from "./metadata-manager";

export class AppConfigMetadataManager {
  public readonly metadataKey = ENCRYPTED_METADATA_KEYS.APP_CONFIG;

  constructor(private mm: SettingsManager) {}

  async get() {
    const metadata = await this.mm.get(this.metadataKey);

    return metadata ? AppConfig.parse(metadata) : new AppConfig();
  }

  set(config: AppConfig) {
    return this.mm.set({
      key: this.metadataKey,
      value: config.serialize(),
    });
  }

  static createFromAuthData(authData: AuthData): AppConfigMetadataManager {
    const settingsManager = createSettingsManager(
      createInstrumentedGraphqlClient({
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
      }),
      authData.appId,
    );

    return new AppConfigMetadataManager(settingsManager);
  }
}
