import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { AppRootConfig } from "@/modules/app-config/app-root-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { StripeConfig } from "./stripe-config";

export type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

/**
 * Stripe webhook will provide ID of config from URL. Repo must be able to access it
 */
export type StripeConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

/**
 * Saleor webhook will have available channel as access pattern. Repo must store channel<->config relation for this case
 */
export type StripeConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

export type GetStripeConfigAccessPattern =
  | StripeConfigByChannelIdAccessPattern
  | StripeConfigByConfigIdAccessPattern;

export interface AppConfigRepo {
  saveStripeConfig: (args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof BaseError>>>;
  getStripeConfig: (
    access: GetStripeConfigAccessPattern,
  ) => Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>>;
  updateStripeConfig: (
    access: {
      configId: string;
      saleorApiUrl: SaleorApiUrl;
      appId: string;
    },
    stripeConfig: StripeConfig,
  ) => Promise<Result<void | null, InstanceType<typeof BaseError>>>;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<Result<AppRootConfig, InstanceType<typeof BaseError>>>;
}

// todo move errors definitions here
