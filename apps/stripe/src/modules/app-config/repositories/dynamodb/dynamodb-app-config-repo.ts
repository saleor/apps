import { BatchGetCommand, Parser, PutItemCommand } from "dynamodb-toolbox";
import { execute } from "dynamodb-toolbox/table/actions/batchGet";
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
} from "@/modules/app-config/repositories/app-config-repo";
import {
  ChannelConfigMappingAccessPattern,
  DynamoDbChannelConfigMappingEntity,
  DynamoDbChannelConfigMappingEntrySchema,
} from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import {
  DynamoDbStripeConfigEntity,
  DynamoDbStripeConfigSchema,
  StripeConfigAccessPattern,
} from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

export class DynamodbAppConfigRepo implements AppConfigRepo {
  private logger = createLogger("DynamodbAppConfigRepo");

  stripeConfig: DynamoDbStripeConfigEntity;
  channelConfigMapping: DynamoDbChannelConfigMappingEntity;

  // todo: why do we inject entities? for testing only?
  constructor(config: {
    entities: {
      stripeConfig: DynamoDbStripeConfigEntity;
      channelConfigMapping: DynamoDbChannelConfigMappingEntity;
    };
  }) {
    this.channelConfigMapping = config.entities.channelConfigMapping;
    this.stripeConfig = config.entities.stripeConfig;
  }

  /**
   * Fetches twice - configs entity and mapping. These are queries. Looks like Toolbox (Dynamo?)
   * can't batch queries
   */
  async getRootConfig(
    access: BaseAccessPattern,
  ): Promise<Result<AppRootConfig, InstanceType<typeof BaseError>>> {
    const allConfigsQuery = this.stripeConfig.table
      .build(QueryCommand)
      .entities(this.stripeConfig)
      .query({
        range: {
          beginsWith: StripeConfigAccessPattern.getSKforAllItems(),
        },
        partition: StripeConfigAccessPattern.getPK({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
        }),
      })
      .options({ maxPages: Infinity });

    const allMappingsQuery = this.channelConfigMapping.table
      .build(QueryCommand)
      .entities(this.channelConfigMapping)
      .query({
        range: {
          beginsWith: ChannelConfigMappingAccessPattern.getSKforAllChannels(),
        },
        partition: ChannelConfigMappingAccessPattern.getPK({
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
          return DynamoDbStripeConfigSchema.build(Parser).parse(item);
        }) ?? [];

      const parsedMappings =
        mappings.Items?.map((item) => {
          return DynamoDbChannelConfigMappingEntrySchema.build(Parser).parse(item);
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
            const configResult = StripeConfig.create({
              name: dynamoItem.configName,
              restrictedKey: createStripeRestrictedKey(dynamoItem.stripeRk)._unsafeUnwrap(), // make it throwable
              webhookId: dynamoItem.stripeWhId,
              id: dynamoItem.configId,
              publishableKey: createStripePublishableKey(dynamoItem.stripePk)._unsafeUnwrap(), // make it throwable
              webhookSecret: createStripeWebhookSecret(dynamoItem.stripeWhSecret)._unsafeUnwrap(), // make it throwable
            });

            if (configResult.isErr()) {
              // Throw and catch it below, so neverthrow can continue
              throw new BaseError("Failed to parse config from DynamoDB", {
                cause: configResult.error,
              });
            }

            record[dynamoItem.configId] = configResult.value;

            return record;
          },
          {} as Record<string, StripeConfig>,
        ),
      );

      return ok(rootConfig);
    } catch (e) {
      return err(
        new AppConfigRepoError.FailureFetchingConfig("Error fetching RootConfig from DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  getStripeConfig(
    access: GetStripeConfigAccessPattern,
  ): Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>> {
    return Promise.resolve(undefined);
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
    const command = this.stripeConfig.build(PutItemCommand).item({
      configId: config.id,
      stripePk: config.publishableKey,
      stripeRk: config.restrictedKey,
      stripeWhId: config.webhookId,
      stripeWhSecret: config.webhookSecret,
      PK: StripeConfigAccessPattern.getPK({ saleorApiUrl, appId }),
      SK: StripeConfigAccessPattern.getSKforSpecificItem({ configId: config.id }),
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
      return err(
        new AppConfigRepoError.FailureSavingConfig("Failed to save config to DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  updateMapping(
    access: BaseAccessPattern,
    data: {
      configId: string;
      channelId: string;
    },
  ): Promise<Result<void | null, InstanceType<typeof BaseError>>> {
    return Promise.resolve(undefined);
  }

  updateStripeConfig(
    access: {
      configId: string;
      saleorApiUrl: SaleorApiUrl;
      appId: string;
    },
    stripeConfig: StripeConfig,
  ): Promise<Result<void | null, InstanceType<typeof BaseError>>> {
    return Promise.resolve(undefined);
  }
}
