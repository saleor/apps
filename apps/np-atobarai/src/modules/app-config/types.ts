import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { AppChannelConfig } from "@/modules/app-config/app-config";

export type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export type AtobaraiConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

export type AtobaraiConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

export type GetAtobaraiConfigAccessPattern =
  | AtobaraiConfigByChannelIdAccessPattern
  | AtobaraiConfigByConfigIdAccessPattern;

export const AppConfigRepoError = BaseError.subclass("AppConfigRepoError");

export interface AppConfigRepo {
  getAtobaraiConfig: (
    access: GetAtobaraiConfigAccessPattern,
  ) => Promise<Result<AppChannelConfig | null, InstanceType<typeof AppConfigRepoError>>>;
}
