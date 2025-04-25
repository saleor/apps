import { GetItemCommand, Parser, PutItemCommand } from "dynamodb-toolbox";
import { QueryCommand } from "dynamodb-toolbox/table/actions/query";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import {
  AppConfigRepo,
  AppConfigRepoError,
  BaseAccessPattern,
  GetStripeConfigAccessPattern,
  StripeConfigByChannelIdAccessPattern,
  StripeConfigByConfigIdAccessPattern,
} from "@/modules/app-config/repositories/app-config-repo";
import {
  DynamoDbChannelConfigMapping,
  DynamoDbChannelConfigMappingEntity,
} from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import {
  DynamoDbStripeConfig,
  DynamoDbStripeConfigEntity,
} from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

// todo: Add pagination to queries
export class DynamodbAppConfigRepo implements AppConfigRepo {
  private logger = createLogger("DynamodbAppConfigRepo");

  stripeConfigEntity: DynamoDbStripeConfigEntity;
  channelConfigMappingEntity: DynamoDbChannelConfigMappingEntity;

  // todo: why do we inject entities? for testing only?
  constructor(config: {
    entities: {
      stripeConfig: DynamoDbStripeConfigEntity;
      channelConfigMapping: DynamoDbChannelConfigMappingEntity;
    };
  }) {
    this.channelConfigMappingEntity = config.entities.channelConfigMapping;
    this.stripeConfigEntity = config.entities.stripeConfig;
  }

  /**
   * Fetches twice - configs entity and mapping. These are queries. Looks like Toolbox (Dynamo?)
   * can't batch queries
   */
  async getRootConfig(
    access: BaseAccessPattern,
  ): Promise<Result<AppRootConfig, InstanceType<typeof BaseError>>> {
    const allConfigsQuery = this.stripeConfigEntity.table
      .build(QueryCommand)
      .entities(this.stripeConfigEntity)
      .query({
        range: {
          beginsWith: DynamoDbStripeConfig.accessPattern.getSKforAllItems(),
        },
        partition: DynamoDbStripeConfig.accessPattern.getPK({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
        }),
      })
      .options({ maxPages: Infinity });

    const allMappingsQuery = this.channelConfigMappingEntity.table
      .build(QueryCommand)
      .entities(this.channelConfigMappingEntity)
      .query({
        range: {
          beginsWith: DynamoDbChannelConfigMapping.accessPattern.getSKforAllChannels(),
        },
        partition: DynamoDbChannelConfigMapping.accessPattern.getPK({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
        }),
      })
      .options({ maxPages: Infinity });

    try {
      const results = await Promise.all([allConfigsQuery, allMappingsQuery].map((q) => q.send()));

      const [configs, mappings] = results;

      /**
       * For some reason types from Dynamo are unions of both entities, instead of valid types, so parsing them to get actual shapes
       */
      const parsedConfigs =
        configs.Items?.map((item) => {
          return DynamoDbStripeConfig.entitySchema.build(Parser).parse(item);
        }) ?? [];

      const parsedMappings =
        mappings.Items?.map((item) => {
          return DynamoDbChannelConfigMapping.entitySchema.build(Parser).parse(item);
        }) ?? [];

      const rootConfig = new AppRootConfig(
        parsedMappings.reduce(
          (record, dynamoItem) => {
            record[dynamoItem.channelId] = dynamoItem.configId;

            return record;
          },
          {} as Record<string, string>,
        ),
        parsedConfigs.reduce(
          (record, dynamoItem) => {
            record[dynamoItem.configId] = this.mapRawDynamoConfigItemToConfigOrThrow(dynamoItem);

            return record;
          },
          {} as Record<string, StripeConfig>,
        ),
      );

      return ok(rootConfig);
    } catch (e) {
      this.logger.error("Failed to fetch RootConfig from DynamoDB", { cause: e });

      return err(
        new AppConfigRepoError.FailureFetchingConfig("Error fetching RootConfig from DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  private fetchStripeConfigByItsId(access: StripeConfigByConfigIdAccessPattern) {
    const query = this.stripeConfigEntity.build(GetItemCommand).key({
      PK: DynamoDbStripeConfig.accessPattern.getPK(access),
      SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({
        configId: access.configId,
      }),
    });

    return query.send();
  }

  private fetchConfigIdFromChannelId(access: StripeConfigByChannelIdAccessPattern) {
    const query = this.channelConfigMappingEntity.build(GetItemCommand).key({
      PK: DynamoDbChannelConfigMapping.accessPattern.getPK(access),
      SK: DynamoDbChannelConfigMapping.accessPattern.getSKforSpecificChannel({
        channelId: access.channelId,
      }),
    });

    return query.send();
  }

  private mapRawDynamoConfigItemToConfigOrThrow(item: unknown) {
    const parsed = DynamoDbStripeConfig.entitySchema.build(Parser).parse(item);

    const configResult = StripeConfig.create({
      name: parsed.configName,
      restrictedKey: createStripeRestrictedKey(parsed.stripeRk)._unsafeUnwrap(), // make it throwable
      webhookId: parsed.stripeWhId,
      id: parsed.configId,
      publishableKey: createStripePublishableKey(parsed.stripePk)._unsafeUnwrap(), // make it throwable
      webhookSecret: createStripeWebhookSecret(parsed.stripeWhSecret)._unsafeUnwrap(), // make it throwable
    });

    if (configResult.isErr()) {
      // Throw and catch it below, so neverthrow can continue, to avoid too much boilerplate
      throw new BaseError("Failed to parse config from DynamoDB", {
        cause: configResult.error,
      });
    }

    return configResult.value;
  }

  async getStripeConfig(
    access: GetStripeConfigAccessPattern,
  ): Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>> {
    const channelId = "channelId" in access ? access.channelId : undefined;
    /**
     * We eventually need config id, so it's mutable. It's either provided or will be resolved later and written here
     */
    let configId = "configId" in access ? access.configId : undefined;

    if (!configId && channelId) {
      try {
        const configIdResult = await this.fetchConfigIdFromChannelId({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
          channelId: channelId,
        });

        if (!configIdResult.Item) {
          return ok(null);
        }

        const parsed = DynamoDbChannelConfigMapping.entitySchema
          .build(Parser)
          .parse(configIdResult.Item);

        configId = parsed.configId;
      } catch (e) {
        return err(
          new AppConfigRepoError.FailureFetchingConfig(
            "Error fetching specific config from DynamoDB",
            {
              cause: e,
            },
          ),
        );
      }
    }

    if (!configId) {
      throw new BaseError("Unreachable code reached");
    }

    try {
      const result = await this.fetchStripeConfigByItsId({
        configId,
        appId: access.appId,
        saleorApiUrl: access.saleorApiUrl,
      });

      if (!result.Item) {
        return ok(null);
      }

      const parsedConfig = this.mapRawDynamoConfigItemToConfigOrThrow(result.Item);

      return ok(parsedConfig);
    } catch (e) {
      this.logger.error("Failed to fetch config from DynamoDB", { cause: e });

      return err(
        new AppConfigRepoError.FailureFetchingConfig(
          "Error fetching specific config from DynamoDB",
          {
            cause: e,
          },
        ),
      );
    }
  }

  async saveStripeConfig({
    config,
    appId,
    saleorApiUrl,
  }: {
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }): Promise<Result<void | null, InstanceType<typeof AppConfigRepoError.FailureSavingConfig>>> {
    const command = this.stripeConfigEntity.build(PutItemCommand).item({
      configId: config.id,
      stripePk: config.publishableKey,
      stripeRk: config.restrictedKey,
      stripeWhId: config.webhookId,
      stripeWhSecret: config.webhookSecret,
      PK: DynamoDbStripeConfig.accessPattern.getPK({ saleorApiUrl, appId }),
      SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({ configId: config.id }),
      configName: config.name,
    });

    try {
      const response = await command.send();

      this.logger.info("Saved config to DynamoDB", {
        dynamoHttpResponseStatusCode: response.$metadata.httpStatusCode,
        configId: config.id,
      });

      return ok(null);
    } catch (e) {
      this.logger.error("Failed to save config to DynamoDB", { cause: e });

      return err(
        new AppConfigRepoError.FailureSavingConfig("Failed to save config to DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  async updateMapping(
    access: BaseAccessPattern,
    data: {
      configId: string;
      channelId: string;
    },
  ): Promise<Result<void | null, InstanceType<typeof BaseError>>> {
    const command = this.channelConfigMappingEntity.build(PutItemCommand).item({
      configId: data.configId,
      channelId: data.channelId,
      PK: DynamoDbChannelConfigMapping.accessPattern.getPK(access),
      SK: DynamoDbChannelConfigMapping.accessPattern.getSKforSpecificChannel({
        channelId: data.channelId,
      }),
    });

    try {
      const result = await command.send();

      this.logger.info("Updated mapping in DynamoDB", {
        dynamoHttpResponseStatusCode: result.$metadata.httpStatusCode,
        configId: data.configId,
        channelId: data.channelId,
      });

      return ok(null);
    } catch (e) {
      this.logger.error("Failed to update mapping in DynamoDB", {
        error: e,
      });

      return err(
        new AppConfigRepoError.FailureSavingConfig("Failed to update mapping in DynamoDB", {
          cause: e,
        }),
      );
    }
  }
}
