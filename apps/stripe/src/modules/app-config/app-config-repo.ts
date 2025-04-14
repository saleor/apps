import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrlType } from "@/modules/saleor/saleor-api-url";

import { StripeConfig } from "./stripe-config";

/**
 * Stripe webhook will provide ID of config from URL. Repo must be able to access it
 */
export type StripeConfigByChannelIdAccessPattern = {
  channelId: string;
  saleorApiUrl: SaleorApiUrlType;
  appId: string;
};

/**
 * Saleor webhook will have available channel as access pattern. Repo must store channel<->config relation for this case
 */
export type StripeConfigByConfigIdAccessPattern = {
  configId: string;
  saleorApiUrl: SaleorApiUrlType;
  appId: string;
};

export type GetStripeConfigAccessPattern =
  | StripeConfigByChannelIdAccessPattern
  | StripeConfigByConfigIdAccessPattern;

export interface AppConfigRepo {
  saveStripeConfig: (args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrlType;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof BaseError>>>;
  getStripeConfig: (
    access: GetStripeConfigAccessPattern,
  ) => Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>>;
  updateStripeConfig: (
    access: {
      configId: string;
      saleorApiUrl: SaleorApiUrlType;
      appId: string;
    },
    stripeConfig: StripeConfig,
  ) => Promise<Result<void | null, InstanceType<typeof BaseError>>>;
}
