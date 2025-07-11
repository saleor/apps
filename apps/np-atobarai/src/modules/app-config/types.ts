import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { AppChannelConfig, AppRootConfig } from "@/modules/app-config/app-config";

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

export type GetChannelConfigAccessPattern =
  | AtobaraiConfigByChannelIdAccessPattern
  | AtobaraiConfigByConfigIdAccessPattern;

export const AppConfigRepoError = BaseError.subclass("AppConfigRepoError");

export interface AppConfigRepo {
  saveChannelConfig: (args: {
    config: AppChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof AppConfigRepoError>>>;
  getChannelConfig: (
    access: GetChannelConfigAccessPattern,
  ) => Promise<Result<AppChannelConfig | null, InstanceType<typeof AppConfigRepoError>>>;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<Result<AppRootConfig, InstanceType<typeof AppConfigRepoError>>>;
  removeConfig: (
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ) => Promise<Result<null, InstanceType<typeof AppConfigRepoError>>>;
  updateMapping: (
    access: BaseAccessPattern,
    data: {
      configId: string | null;
      channelId: string;
    },
  ) => Promise<Result<void | null, InstanceType<typeof AppConfigRepoError>>>;
}
