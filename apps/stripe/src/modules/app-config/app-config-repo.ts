import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { StripeConfig } from "./stripe-config";

export interface AppConfigRepo {
  saveStripeConfig: (args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<void, InstanceType<typeof BaseError>>>;
  getStripeConfig: (args: {
    channelId: string;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>>;
}
