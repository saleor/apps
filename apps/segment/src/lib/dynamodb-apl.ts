import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

import { env } from "@/env";
import { BaseError } from "@/errors";
import { APLRepository } from "@/modules/db/types";

export class DynamoAPL implements APL {
  static SetAuthDataError = BaseError.subclass("SetAuthDataError");
  static DeleteAuthDataError = BaseError.subclass("DeleteAuthDataError");
  static MissingEnvVariablesError = BaseError.subclass("MissingEnvVariablesError");

  constructor(private deps: { repository: APLRepository }) {}

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const getEntryResult = await this.deps.repository.getEntry({
      saleorApiUrl,
    });

    if (getEntryResult.isErr()) {
      return undefined;
    }

    return getEntryResult.value;
  }

  async set(authData: AuthData): Promise<void> {
    const setEntryResult = await this.deps.repository.setEntry({
      authData,
    });

    if (setEntryResult.isErr()) {
      throw new DynamoAPL.SetAuthDataError("Failed to set APL entry", {
        cause: setEntryResult.error,
      });
    }

    return undefined;
  }

  async delete(saleorApiUrl: string): Promise<void> {
    const deleteEntryResult = await this.deps.repository.deleteEntry({
      saleorApiUrl,
    });

    if (deleteEntryResult.isErr()) {
      throw new DynamoAPL.DeleteAuthDataError("Failed to delete APL entry", {
        cause: deleteEntryResult.error,
      });
    }

    return undefined;
  }

  async getAll(): Promise<AuthData[]> {
    const getAllEntriesResult = await this.deps.repository.getAllEntries();

    if (getAllEntriesResult.isErr()) {
      return [];
    }

    return getAllEntriesResult.value;
  }

  async isReady(): Promise<AplReadyResult> {
    const ready = this.envVariablesRequriedByDynamoDBExist();

    return ready
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const configured = this.envVariablesRequriedByDynamoDBExist();

    return configured
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
        };
  }

  private envVariablesRequriedByDynamoDBExist() {
    const variables = [
      "DYNAMODB_MAIN_TABLE_NAME",
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
    ] as const;

    return variables.every((variable) => !!env[variable]);
  }
}
