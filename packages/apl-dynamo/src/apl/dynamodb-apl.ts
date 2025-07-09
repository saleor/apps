import { SpanStatusCode, Tracer } from "@opentelemetry/api";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";
import { BaseError } from "@saleor/errors";

import { APLRepository } from "./apl-repository";

type Envs = {
  APL_TABLE_NAME: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
};

export class DynamoAPL implements APL {
  static GetAuthDataError = BaseError.subclass("GetAuthDataError");
  static SetAuthDataError = BaseError.subclass("SetAuthDataError");
  static DeleteAuthDataError = BaseError.subclass("DeleteAuthDataError");
  static GetAllAuthDataError = BaseError.subclass("GetAllAuthDataError");
  static MissingEnvVariablesError = BaseError.subclass("MissingEnvVariablesError");

  private repository: APLRepository;

  private tracer: Tracer;

  private env: Envs;

  constructor(deps: { repository: APLRepository; tracer: Tracer; env: Envs }) {
    this.repository = deps.repository;
    this.tracer = deps.tracer;
    this.env = deps.env;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    return this.tracer.startActiveSpan("DynamoAPL.get", async (span) => {
      try {
        const getEntryResult = await this.repository.getEntry({
          saleorApiUrl,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        return getEntryResult ?? undefined;
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new DynamoAPL.GetAuthDataError("Failed to get APL entry", {
          cause: e,
        });
      }
    });
  }

  async set(authData: AuthData): Promise<void> {
    return this.tracer.startActiveSpan("DynamoAPL.set", async (span) => {
      try {
        await this.repository.setEntry({
          authData,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new DynamoAPL.SetAuthDataError("Failed to set APL entry", {
          cause: e,
        });
      }
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
    return this.tracer.startActiveSpan("DynamoAPL.delete", async (span) => {
      try {
        await this.repository.deleteEntry({
          saleorApiUrl,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new DynamoAPL.DeleteAuthDataError("Failed to set APL entry", {
          cause: e,
        });
      }
    });
  }

  async getAll(): Promise<AuthData[]> {
    return this.tracer.startActiveSpan("DynamoAPL.getAll", async (span) => {
      try {
        const getAllEntriesResult = await this.repository.getAllEntries();

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        return getAllEntriesResult ?? [];
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new DynamoAPL.GetAllAuthDataError("Failed to set APL entry", {
          cause: e,
        });
      }
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
      "APL_TABLE_NAME",
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
    ] as const;

    // Dont check for existence, in localhost keys are empty, so just check if envs are set
    return variables.every((variable) => typeof this.env[variable] === "string");
  }
}
