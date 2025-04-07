import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { StripeConfig } from "./stripe-config";

export interface AppConfigPersistor {
  saveStripeConfig: (args: {
    channelId: string;
    config: StripeConfig;
    // TODO: maybe saleorApiUrl should be value object as well?
    saleorApiUrl: string;
    appId: string;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
  getStripeConfig: (args: {
    channelId: string;
    saleorApiUrl: string;
    appId: string;
  }) => Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>>;
}
