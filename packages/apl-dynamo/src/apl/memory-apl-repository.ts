import { AuthData } from "@saleor/app-sdk/APL";

import { APLRepository } from "./apl-repository";

/**
 * Testing repository that keeps data in memory
 */
export class MemoryAPLRepository implements APLRepository {
  public entries: Record<string, AuthData> = {};

  async getEntry(args: { saleorApiUrl: string }): Promise<AuthData | null> {
    if (this.entries[args.saleorApiUrl]) {
      return this.entries[args.saleorApiUrl];
    }

    return null;
  }

  async setEntry(args: { authData: AuthData }): Promise<void> {
    this.entries[args.authData.saleorApiUrl] = args.authData;

    return undefined;
  }

  async deleteEntry(args: { saleorApiUrl: string }): Promise<void> {
    if (this.entries[args.saleorApiUrl]) {
      delete this.entries[args.saleorApiUrl];

      return undefined;
    }

    throw new Error("Error deleteEntry");
  }

  async getAllEntries(): Promise<AuthData[] | null> {
    const values = Object.values(this.entries);

    if (values.length === 0) {
      return null;
    }

    return values;
  }
}
