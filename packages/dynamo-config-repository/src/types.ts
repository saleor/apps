import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { Result } from "neverthrow";

import { GenericRootConfig } from "./generic-root-config";

export type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

export type ConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

export type ConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

export type GetChannelConfigAccessPattern =
  | ConfigByChannelIdAccessPattern
  | ConfigByConfigIdAccessPattern;

export interface BaseConfig {
  id: string;
}

export const RepoError = BaseError.subclass("DynamoConfigRepositoryError");

export interface GenericRepo<ChannelConfig extends BaseConfig> {
  saveChannelConfig: (args: {
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof RepoError>>>;
  getChannelConfig: (
    access: GetChannelConfigAccessPattern,
  ) => Promise<Result<ChannelConfig | null, InstanceType<typeof RepoError>>>;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<Result<GenericRootConfig<ChannelConfig>, InstanceType<typeof RepoError>>>;
  removeConfig: (
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ) => Promise<Result<null, InstanceType<typeof RepoError>>>;
  updateMapping: (
    access: BaseAccessPattern,
    data: {
      configId: string | null;
      channelId: string;
    },
  ) => Promise<Result<void | null, InstanceType<typeof RepoError>>>;
}
