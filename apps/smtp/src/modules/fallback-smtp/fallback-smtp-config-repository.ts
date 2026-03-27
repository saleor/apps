import {
  anyOf,
  boolean,
  Entity,
  GetItemCommand,
  item,
  nul,
  PutItemCommand,
  string,
} from "dynamodb-toolbox";
import { ResultAsync } from "neverthrow";

import { BaseError } from "../../errors";
import { createLogger } from "../../logger";
import { DynamoMainTable } from "../dynamodb/dynamo-main-table";

const SK_VALUE = "fallback_config";

const fallbackConfigSchema = item({
  PK: string().key(),
  SK: string().key(),
  fallbackEnabled: boolean(),
  fallbackRedirectEmail: anyOf(string(), nul()).optional(),
});

const createFallbackConfigEntity = (table: DynamoMainTable) =>
  new Entity({
    table,
    name: "FallbackSmtpConfig",
    schema: fallbackConfigSchema,
    timestamps: {
      created: {
        name: "createdAt",
        savedAs: "createdAt",
      },
      modified: {
        name: "modifiedAt",
        savedAs: "modifiedAt",
      },
    },
  });

export interface FallbackSmtpConfig {
  fallbackEnabled: boolean;
  fallbackRedirectEmail: string | null;
}

export interface IGetFallbackSmtpConfig {
  getFallbackConfig(): ResultAsync<FallbackSmtpConfig, InstanceType<typeof BaseError>>;
}

export class FallbackSmtpConfigRepository implements IGetFallbackSmtpConfig {
  static FallbackSmtpConfigRepoError = BaseError.subclass("FallbackSmtpConfigRepoError");
  static FetchConfigError = this.FallbackSmtpConfigRepoError.subclass("FetchConfigError");
  static SaveConfigError = this.FallbackSmtpConfigRepoError.subclass("SaveConfigError");

  private entity: ReturnType<typeof createFallbackConfigEntity>;
  private pk: string;
  private logger = createLogger("FallbackSmtpConfigRepository");

  constructor({
    table,
    saleorApiUrl,
    appId,
  }: {
    table: DynamoMainTable;
    saleorApiUrl: string;
    appId: string;
  }) {
    this.entity = createFallbackConfigEntity(table);
    this.pk = DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  getFallbackConfig(): ResultAsync<FallbackSmtpConfig, InstanceType<typeof BaseError>> {
    return ResultAsync.fromPromise(this.fetchConfig(), (error) => {
      this.logger.error("Failed to fetch fallback config from DynamoDB", { error });

      return new FallbackSmtpConfigRepository.FetchConfigError(
        "Failed to fetch fallback config from DynamoDB",
        { cause: error },
      );
    });
  }

  setFallbackConfig(
    config: FallbackSmtpConfig,
  ): ResultAsync<void, InstanceType<typeof BaseError>> {
    return ResultAsync.fromPromise(this.writeConfig(config), (error) => {
      this.logger.error("Failed to save fallback config to DynamoDB", { error });

      return new FallbackSmtpConfigRepository.SaveConfigError(
        "Failed to save fallback config to DynamoDB",
        { cause: error },
      );
    });
  }

  private async fetchConfig(): Promise<FallbackSmtpConfig> {
    const operation = this.entity.build(GetItemCommand).key({
      PK: this.pk,
      SK: SK_VALUE,
    });

    const result = await operation.send();

    if (result.$metadata.httpStatusCode !== 200) {
      throw new FallbackSmtpConfigRepository.FetchConfigError(
        `Unexpected DynamoDB response: ${result.$metadata.httpStatusCode}`,
      );
    }

    if (!result.Item) {
      return { fallbackEnabled: false, fallbackRedirectEmail: null };
    }

    return {
      fallbackEnabled: result.Item.fallbackEnabled,
      fallbackRedirectEmail: result.Item.fallbackRedirectEmail ?? null,
    };
  }

  private async writeConfig(config: FallbackSmtpConfig): Promise<void> {
    const operation = this.entity.build(PutItemCommand).item({
      PK: this.pk,
      SK: SK_VALUE,
      fallbackEnabled: config.fallbackEnabled,
      fallbackRedirectEmail: config.fallbackRedirectEmail,
    });

    const result = await operation.send();

    if (result.$metadata.httpStatusCode !== 200) {
      throw new FallbackSmtpConfigRepository.SaveConfigError(
        `Unexpected DynamoDB response: ${result.$metadata.httpStatusCode}`,
      );
    }
  }
}
