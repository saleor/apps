import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

import { ShopifyConnectionConfig } from "../domain/shopify-connection-config";

export const ConnectionConfigRepoError = BaseError.subclass("ConnectionConfigRepoError", {
  props: { _brand: "ConnectionConfigRepoError" as const },
});

export type ConnectionConfigRepoErrorType = InstanceType<typeof ConnectionConfigRepoError>;

export interface ConnectionConfigRepo {
  get(args: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<ShopifyConnectionConfig | null, ConnectionConfigRepoErrorType>>;

  save(args: {
    saleorApiUrl: string;
    appId: string;
    config: ShopifyConnectionConfig;
  }): Promise<Result<void, ConnectionConfigRepoErrorType>>;

  delete(args: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<void, ConnectionConfigRepoErrorType>>;
}
