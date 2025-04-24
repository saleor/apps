import { AuthData } from "@saleor/app-sdk/APL";
import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

// TODO Declare better errors
export interface APLRepository {
  getEntry(args: {
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<AuthData | null, InstanceType<typeof BaseError>>>;
  setEntry(args: { authData: AuthData }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  deleteEntry(args: {
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  getAllEntries(): Promise<Result<AuthData[] | null, InstanceType<typeof BaseError>>>;
}
