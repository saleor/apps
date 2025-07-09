import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

import { env } from "@/lib/env";
import { BaseError, ValueError } from "@/lib/errors";
import { appInternalTracer } from "@/lib/tracing";
import { APLRepository } from "@/modules/apl/apl-repository";
import { createSaleorApiUrl, SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class DynamoAPL implements APL {
  static GetAuthDataError = BaseError.subclass("GetAuthDataError");
  static SetAuthDataError = BaseError.subclass("SetAuthDataError");
  static DeleteAuthDataError = BaseError.subclass("DeleteAuthDataError");
  static GetAllAuthDataError = BaseError.subclass("GetAllAuthDataError");
  static MissingEnvVariablesError = BaseError.subclass("MissingEnvVariablesError");

  private repository: APLRepository;

  private tracer = appInternalTracer;

  constructor(deps: { repository: APLRepository }) {
    this.repository = deps.repository;
  }

  async get(saleorApiUrl: SaleorApiUrl | string): Promise<AuthData | undefined> {
    const saleorApiUrlParsed = createSaleorApiUrl(saleorApiUrl);

    if (saleorApiUrlParsed.isErr()) {
      // Throw, this is programming error, we don't want to recover from here.
      throw new ValueError("Value Error: Provided saleorApiUrl is invalid.");
    }

    return this.tracer.startActiveSpan("DynamoAPL.get", async (span) => {
      const getEntryResult = await this.repository.getEntry({
        saleorApiUrl: saleorApiUrlParsed.value,
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
      const setEntryResult = await this.repository.setEntry({
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
    const saleorApiUrlParsed = createSaleorApiUrl(saleorApiUrl);

    if (saleorApiUrlParsed.isErr()) {
      // Throw, this is programming error, we don't want to recover from here.
      throw new ValueError("Value Error: Provided saleorApiUrl is invalid.");
    }

    return this.tracer.startActiveSpan("DynamoAPL.delete", async (span) => {
      const deleteEntryResult = await this.repository.deleteEntry({
        saleorApiUrl: saleorApiUrlParsed.value,
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
      const getAllEntriesResult = await this.repository.getAllEntries();

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
    const ready = this.envVariablesRequiredByDynamoDBExist();

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
    const configured = this.envVariablesRequiredByDynamoDBExist();

    return configured
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
        };
  }

  private envVariablesRequiredByDynamoDBExist() {
    const variables = [
      "DYNAMODB_MAIN_TABLE_NAME",
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
    ] as const;

    // Dont check for existence, in localhost keys are empty, so just check if envs are set
    return variables.every((variable) => typeof env[variable] === "string");
  }
}
