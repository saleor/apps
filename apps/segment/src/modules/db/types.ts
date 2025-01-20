import { AuthData } from "@saleor/app-sdk/APL";
import { Result } from "neverthrow";

import { BaseError } from "@/errors";

import { AppConfig } from "../configuration/app-config";

export interface APLRepository {
  getEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<AuthData | null, InstanceType<typeof BaseError>>>;
  setEntry(args: { authData: AuthData }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  deleteEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  getAllEntries(): Promise<Result<AuthData[] | null, InstanceType<typeof BaseError>>>;
}

export interface ConfigRepository {
  getAppConfigEntry: (args: {
    saleorApiUrl: string;
    appId: string;
    configKey: string;
  }) => Promise<Result<AppConfig | null, InstanceType<typeof BaseError>>>;
  setAppConfigEntry: (args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    config: AppConfig;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
}
