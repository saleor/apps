import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";

import { env } from "@/env";
import { BaseError } from "@/errors";

import { ConfigRepository } from "../db/segment-config-repository";
import { AppConfig } from "./app-config";

export interface AppConfigMetadataManager {
  get(args: { saleorApiUrl: string; appId: string }): Promise<AppConfig | null>;
  set(args: { config: AppConfig; saleorApiUrl: string; appId: string }): Promise<void>;
}

export class DynamoDBAppConfigMetadataManager implements AppConfigMetadataManager {
  public readonly metadataKey = "app-config-v1";

  static GetConfigDataError = BaseError.subclass("GetConfigDataError");
  static SetConfigDataError = BaseError.subclass("SetConfigDataError");

  private constructor(
    private deps: {
      repository: ConfigRepository;
      encryptionKey: string;
    },
  ) {}

  static create(repository: ConfigRepository) {
    return new DynamoDBAppConfigMetadataManager({ repository, encryptionKey: env.SECRET_KEY });
  }

  async get(args: { saleorApiUrl: string; appId: string }) {
    const getEntryResult = await this.deps.repository.getEntry({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configKey: this.metadataKey,
    });

    if (getEntryResult.isErr()) {
      throw new DynamoDBAppConfigMetadataManager.GetConfigDataError("Failed to get config data", {
        cause: getEntryResult.error,
      });
    }

    if (!getEntryResult.value) {
      return null;
    }

    const decryptedConfig = decrypt(getEntryResult.value, this.deps.encryptionKey);

    return AppConfig.parse(decryptedConfig);
  }

  async set(args: { config: AppConfig; saleorApiUrl: string; appId: string }) {
    const encryptedConfig = encrypt(args.config.serialize(), this.deps.encryptionKey);

    const setEntryResult = await this.deps.repository.setEntry({
      appId: args.appId,
      saleorApiUrl: args.saleorApiUrl,
      configKey: this.metadataKey,
      configValue: encryptedConfig,
    });

    if (setEntryResult.isErr()) {
      throw new DynamoDBAppConfigMetadataManager.SetConfigDataError("Failed to set config data", {
        cause: setEntryResult.error,
      });
    }

    return undefined;
  }
}
