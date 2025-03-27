import { ok, Result } from "neverthrow";

import { BaseError } from "@/errors";
import { AppConfig } from "@/modules/configuration/app-config";

import { ConfigRepository } from "../types";

export class MemoryConfigRepository implements ConfigRepository {
  public entries: Record<string, AppConfig> = {};

  async getAppConfigEntry(args: {
    saleorApiUrl: string;
    appId: string;
    configKey: string;
  }): Promise<Result<AppConfig | null, InstanceType<typeof BaseError>>> {
    const key = `${args.saleorApiUrl}#${args.appId}`;

    if (this.entries[key]) {
      return ok(this.entries[key]);
    }

    return ok(null);
  }

  async setAppConfigEntry(args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    config: AppConfig;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    const key = `${args.saleorApiUrl}#${args.appId}`;

    this.entries[key] = args.config;

    return ok(undefined);
  }
}
