import { AuthData } from "@saleor/app-sdk/APL";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";
import { APLRepository } from "@/modules/db/types";

export class InMemoryAPLRepository implements APLRepository {
  public entries: Record<string, AuthData> = {};

  async getEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<AuthData, InstanceType<typeof BaseError>>> {
    if (this.entries[args.saleorApiUrl]) {
      return ok(this.entries[args.saleorApiUrl]);
    }

    return err(new BaseError("Error geting entry"));
  }

  async setEntry(args: {
    authData: AuthData;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    this.entries[args.authData.saleorApiUrl] = args.authData;
    return ok(undefined);
  }

  async deleteEntry(args: {
    saleorApiUrl: string;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    if (this.entries[args.saleorApiUrl]) {
      delete this.entries[args.saleorApiUrl];
      return ok(undefined);
    }

    return err(new BaseError("Error deleting entry"));
  }

  async getAllEntries(): Promise<Result<AuthData[], InstanceType<typeof BaseError>>> {
    return ok(Object.values(this.entries));
  }
}
