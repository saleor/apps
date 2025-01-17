import { AuthData } from "@saleor/app-sdk/APL";
import { Result } from "neverthrow";

import { BaseError } from "@/errors";

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
  getEntry: (args: {
    saleorApiUrl: string;
    appId: string;
    configKey: string;
  }) => Promise<Result<string | null, InstanceType<typeof BaseError>>>;
  setEntry: (args: {
    appId: string;
    saleorApiUrl: string;
    configKey: string;
    configValue: string;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
}
