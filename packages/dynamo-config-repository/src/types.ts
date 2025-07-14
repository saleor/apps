import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";

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
