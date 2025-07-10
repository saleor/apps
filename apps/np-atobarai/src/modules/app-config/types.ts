import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Result } from "neverthrow";

export class AtobaraiConfig {
  // TODO: Define the properties of the AtobaraiConfig
}

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

export interface AppConfigRepo {
  getAtobaraiConfig: (
    access: GetAtobaraiConfigAccessPattern,
    // TODO: Define strict errors
  ) => Promise<Result<AtobaraiConfig | null, Error>>;
}
