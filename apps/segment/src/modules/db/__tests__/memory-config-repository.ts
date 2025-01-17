import { ok } from "neverthrow";

import { AppConfig } from "@/modules/configuration/app-config";

import { ConfigRepository } from "../types";

export class MemoryConfigRepository implements ConfigRepository {
  public entries: Record<string, AppConfig> = {};

  async getAppConfigEntry(args: { saleorApiUrl: string; appId: string; configKey: string }) {
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
  }) {
    const key = `${args.saleorApiUrl}#${args.appId}`;

    this.entries[key] = args.config;
    return ok(undefined);
  }
}
