import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "modern-errors";
import { Result } from "neverthrow";

export const RepoError = BaseError.subclass("RepoError");

export interface BaseConfig {
  readonly id: string;
  readonly name: string;
}

export type ConfigByChannelIdAccessPattern = {
  appId: string;
  saleorApiUrl: SaleorApiUrl;
  channelId: string;
};

export type ConfigByConfigIdAccessPattern = {
  appId: string;
  saleorApiUrl: SaleorApiUrl;
  configId: string;
};

export type GetChannelConfigAccessPattern =
  | ConfigByChannelIdAccessPattern
  | ConfigByConfigIdAccessPattern;

export type BaseAccessPattern = {
  appId: string;
  saleorApiUrl: SaleorApiUrl;
};

export interface GenericRepo<ChannelConfig extends BaseConfig> {
  getChannelConfig(
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<ChannelConfig | null, InstanceType<typeof RepoError>>>;

  saveChannelConfig(args: {
    appId: string;
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  deleteChannelConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  getAllChannelConfigs(
    access: BaseAccessPattern,
  ): Promise<Result<ChannelConfig[], InstanceType<typeof RepoError>>>;

  getAllChannelMappings(access: BaseAccessPattern): Promise<
    Result<
      Array<{
        channelId: string;
        configId: string;
      }>,
      InstanceType<typeof RepoError>
    >
  >;
}
