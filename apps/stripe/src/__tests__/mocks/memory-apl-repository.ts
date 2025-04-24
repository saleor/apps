import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { APLRepository } from "@/modules/apl/apl-repository";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

/**
 * Testing repository that keeps data in memory
 */
export class MemoryAPLRepository implements APLRepository {
  public entries: Record<string, AuthData> = {};

  async getEntry(args: {
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<AuthData | null, InstanceType<typeof BaseError>>> {
    if (this.entries[args.saleorApiUrl]) {
      return ok(this.entries[args.saleorApiUrl]);
    }

    return ok(null);
  }

  async setEntry(args: {
    authData: AuthData;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    this.entries[args.authData.saleorApiUrl] = args.authData;

    return ok(undefined);
  }

  async deleteEntry(args: {
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    if (this.entries[args.saleorApiUrl]) {
      delete this.entries[args.saleorApiUrl];

      return ok(undefined);
    }

    return err(new BaseError("Error deleting entry"));
  }

  async getAllEntries(): Promise<Result<AuthData[] | null, InstanceType<typeof BaseError>>> {
    const values = Object.values(this.entries);

    if (values.length === 0) {
      return ok(null);
    }

    return ok(values);
  }
}
