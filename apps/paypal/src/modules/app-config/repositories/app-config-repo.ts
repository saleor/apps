import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { GetChannelConfigAccessPattern, RepoError } from "@saleor/pg-config-repository";
import { Result } from "neverthrow";

import { PayPalConfig } from "../domain/paypal-config";

export interface AppConfigRepo {
  getPayPalConfig(
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<PayPalConfig | null, InstanceType<typeof RepoError>>>;

  savePayPalConfig(args: {
    appId: string;
    config: PayPalConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  deletePayPalConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>>;

  getAllPayPalConfigs(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig[], InstanceType<typeof RepoError>>>;

  getAllChannelMappings(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<
    Result<
      Array<{
        channelId: string;
        configId: string;
      }>,
      InstanceType<typeof RepoError>
    >
  >;
}
