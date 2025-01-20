import { env } from "@/env";
import { BaseError } from "@/errors";

import { ConfigRepository } from "../db/types";
import { AppConfig } from "./app-config";

export interface AppConfigManager {
  get(args: { saleorApiUrl: string; appId: string }): Promise<AppConfig | null>;
  set(args: { config: AppConfig; saleorApiUrl: string; appId: string }): Promise<void>;
}

export class DynamoAppConfigManager implements AppConfigManager {
  public readonly configKey = "app-config-v1";

  static GetConfigDataError = BaseError.subclass("GetConfigDataError");
  static SetConfigDataError = BaseError.subclass("SetConfigDataError");

  private constructor(
    private deps: {
      repository: ConfigRepository;
      encryptionKey: string;
    },
  ) {}

  static create(repository: ConfigRepository) {
    return new DynamoAppConfigManager({ repository, encryptionKey: env.SECRET_KEY });
  }

  async get(args: { saleorApiUrl: string; appId: string }) {
    const getEntryResult = await this.deps.repository.getAppConfigEntry({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configKey: this.configKey,
    });

    if (getEntryResult.isErr()) {
      throw new DynamoAppConfigManager.GetConfigDataError("Failed to get config data", {
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
      configKey: this.configKey,
      config: args.config,
    });

    if (setEntryResult.isErr()) {
      throw new DynamoAppConfigManager.SetConfigDataError("Failed to set config data", {
        cause: setEntryResult.error,
      });
    }

    return undefined;
  }
}
