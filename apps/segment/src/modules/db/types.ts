import { AuthData } from "@saleor/app-sdk/APL";
import { Result } from "neverthrow";

import { BaseError } from "@/errors";

export interface APLRepository {
  getEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<AuthData | null, InstanceType<typeof BaseError>>>;
  setEntry(args: { authData: AuthData }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  deleteEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<void, InstanceType<typeof BaseError>>>;
  getAllEntries(): Promise<Result<AuthData[] | null, InstanceType<typeof BaseError>>>;
}
