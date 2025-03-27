import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

import { env } from "@/env";
import { BaseError } from "@/errors";
import { APLRepository } from "@/modules/db/types";

import { appRootTracer } from "./app-root-tracer";

export class DynamoAPL implements APL {
  static GetAuthDataError = BaseError.subclass("GetAuthDataError");
  static SetAuthDataError = BaseError.subclass("SetAuthDataError");
  static DeleteAuthDataError = BaseError.subclass("DeleteAuthDataError");
  static GetAllAuthDataError = BaseError.subclass("GetAllAuthDataError");
  static MissingEnvVariablesError = BaseError.subclass("MissingEnvVariablesError");

  private tracer = appRootTracer;

  constructor(private deps: { repository: APLRepository }) {}

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    return this.tracer.startActiveSpan("DynamoAPL.get", async (span) => {
      const getEntryResult = await this.deps.repository.getEntry({
        saleorApiUrl,
      });

      if (getEntryResult.isErr()) {
        span.end();
        throw new DynamoAPL.GetAuthDataError("Failed to get APL entry", {
          cause: getEntryResult.error,
        });
      }

      if (!getEntryResult.value) {
        span.end();

        return undefined;
      }

      span.end();

      return getEntryResult.value;
    });
  }

  async set(authData: AuthData): Promise<void> {
    return this.tracer.startActiveSpan("DynamoAPL.set", async (span) => {
      const setEntryResult = await this.deps.repository.setEntry({
        authData,
      });

      if (setEntryResult.isErr()) {
        span.end();
        throw new DynamoAPL.SetAuthDataError("Failed to set APL entry", {
          cause: setEntryResult.error,
        });
      }

      span.end();

      return undefined;
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
    return this.tracer.startActiveSpan("DynamoAPL.delete", async (span) => {
      const deleteEntryResult = await this.deps.repository.deleteEntry({
        saleorApiUrl,
      });

      if (deleteEntryResult.isErr()) {
        span.end();
        throw new DynamoAPL.DeleteAuthDataError("Failed to delete APL entry", {
          cause: deleteEntryResult.error,
        });
      }

      span.end();

      return undefined;
    });
  }

  async getAll(): Promise<AuthData[]> {
    return this.tracer.startActiveSpan("DynamoAPL.getAll", async (span) => {
      const getAllEntriesResult = await this.deps.repository.getAllEntries();

      if (getAllEntriesResult.isErr()) {
        span.end();
        throw new DynamoAPL.GetAllAuthDataError("Failed to get all APL entries", {
          cause: getAllEntriesResult.error,
        });
      }

      if (!getAllEntriesResult.value) {
        span.end();

        return [];
      }

      span.end();

      return getAllEntriesResult.value;
    });
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
