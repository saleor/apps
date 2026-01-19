import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { Result } from "neverthrow";

import { PayPalConfig } from "../domain/paypal-config";

export interface AppConfigRepo {
  getPayPalConfig(args: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig | null, Error>>;

  savePayPalConfig(args: {
    appId: string;
    config: PayPalConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>>;

  deletePayPalConfig(args: {
    appId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>>;

  saveChannelMapping(args: {
    appId: string;
    channelId: string;
    configId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>>;

  deleteChannelMapping(args: {
    appId: string;
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, Error>>;

  getAllPayPalConfigs(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<PayPalConfig[], Error>>;

  getAllChannelMappings(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<Array<{ channelId: string; configId: string }>, Error>>;
}
