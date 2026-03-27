import * as Sentry from "@sentry/nextjs";
import { errAsync, ResultAsync } from "neverthrow";

import { getDynamoEnv } from "../../env-dynamodb";
import { BaseError } from "../../errors";
import { createLogger } from "../../logger";
import { createDynamoMainTable } from "../dynamodb/dynamo-main-table";
import { getFallbackSmtpConfigSchema } from "../smtp/configuration/smtp-config-schema";
import {
  type FallbackSmtpConfig,
  FallbackSmtpConfigRepository,
  type IGetFallbackSmtpConfig,
} from "./fallback-smtp-config-repository";

const logger = createLogger("FallbackSmtpService");

export class FallbackSmtpService implements IGetFallbackSmtpConfig {
  static FallbackSmtpServiceError = BaseError.subclass("FallbackSmtpServiceError");
  static FallbackSmtpNotAvailableError = this.FallbackSmtpServiceError.subclass(
    "FallbackSmtpNotAvailableError",
  );

  private repo: FallbackSmtpConfigRepository | null = null;

  constructor(
    private args: {
      saleorApiUrl: string;
    },
  ) { }

  getFallbackConfig(): ResultAsync<FallbackSmtpConfig, InstanceType<typeof BaseError>> {
    return this.getRepo().andThen((repo) => repo.getFallbackConfig());
  }

  setFallbackConfig(config: FallbackSmtpConfig): ResultAsync<void, InstanceType<typeof BaseError>> {
    return this.getRepo().andThen((repo) => repo.setFallbackConfig(config));
  }

  private getRepo(): ResultAsync<FallbackSmtpConfigRepository, InstanceType<typeof BaseError>> {
    if (!getFallbackSmtpConfigSchema()) {
      return errAsync(
        new FallbackSmtpService.FallbackSmtpNotAvailableError(
          "Fallback SMTP env vars are not configured",
        ),
      );
    }

    if (this.repo) {
      return ResultAsync.fromSafePromise(Promise.resolve(this.repo));
    }

    try {
      const dynamoEnv = getDynamoEnv();
      const table = createDynamoMainTable(dynamoEnv);

      this.repo = new FallbackSmtpConfigRepository({
        table,
        saleorApiUrl: this.args.saleorApiUrl,
      });

      return ResultAsync.fromSafePromise(Promise.resolve(this.repo));
    } catch (error) {
      logger.error("DynamoDB env vars are not configured for fallback SMTP", { error });

      Sentry.captureException(error, {
        tags: {
          module: "FallbackSmtpService",
        },
      });

      return errAsync(
        new FallbackSmtpService.FallbackSmtpNotAvailableError(
          "DynamoDB is not configured - cannot use fallback SMTP",
          { cause: error },
        ),
      );
    }
  }
}
