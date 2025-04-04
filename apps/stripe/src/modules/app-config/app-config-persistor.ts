import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { StripeConfig } from "./stripe-config";

export interface AppConfigPresistor {
  persistStripeConfig: (args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: string;
    appId: string;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
  retrieveStripeConfig: (args: {
    channelId: string;
    saleorApiUrl: string;
    appId: string;
  }) => Promise<Result<StripeConfig, InstanceType<typeof BaseError>>>;
}
