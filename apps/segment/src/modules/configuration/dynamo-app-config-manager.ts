import { env } from "@/env";
import { BaseError } from "@/errors";

import { ConfigRepository } from "../db/types";
import { AppConfig } from "./app-config";

export interface AppConfigManager {
  get(args: { saleorApiUrl: string; appId: string }): Promise<AppConfig | null>;
  set(args: { config: AppConfig; saleorApiUrl: string; appId: string }): Promise<void>;
}

export class DynamoDBAppConfigManager implements AppConfigManager {
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
    return new DynamoDBAppConfigManager({ repository, encryptionKey: env.SECRET_KEY });
  }

  async get(args: { saleorApiUrl: string; appId: string }) {
    const getEntryResult = await this.deps.repository.getAppConfigEntry({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configKey: this.metadataKey,
    });

    if (getEntryResult.isErr()) {
      throw new DynamoDBAppConfigManager.GetConfigDataError("Failed to get config data", {
        cause: getEntryResult.error,
      });
    }

    if (!getEntryResult.value) {
      return null;
    }

    return getEntryResult.value;
  }

  async set(args: { config: AppConfig; saleorApiUrl: string; appId: string }) {
    const setEntryResult = await this.deps.repository.setAppConfigEntry({
      appId: args.appId,
      saleorApiUrl: args.saleorApiUrl,
      configKey: this.metadataKey,
      config: args.config,
    });

    if (setEntryResult.isErr()) {
      throw new DynamoDBAppConfigManager.SetConfigDataError("Failed to set config data", {
        cause: setEntryResult.error,
      });
    }

    return undefined;
  }
}