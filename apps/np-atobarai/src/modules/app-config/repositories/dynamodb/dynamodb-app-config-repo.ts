import { DeleteItemCommand, GetItemCommand, Parser, PutItemCommand } from "dynamodb-toolbox";
import { EntityRepository } from "dynamodb-toolbox/entity/actions/repository";
import { QueryCommand } from "dynamodb-toolbox/table/actions/query";
import { TableRepository } from "dynamodb-toolbox/table/actions/repository";
import { err, ok, Result } from "neverthrow";

import { Encryptor } from "@/lib/encryptor";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig } from "@/modules/app-config/domain/app-channel-config";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import {
  AppConfigRepo,
  AppConfigRepoError,
  BaseAccessPattern,
  ConfigByChannelIdAccessPattern,
  ConfigByConfigIdAccessPattern,
  GetChannelConfigAccessPattern,
} from "@/modules/app-config/repositories/app-config-repo";
import {
  DynamoDbAppConfig,
  DynamoDbAppConfigEntity,
} from "@/modules/app-config/repositories/dynamodb/app-config-db-model";
import {
  DynamoDbChannelConfigMapping,
  DynamoDbChannelConfigMappingEntity,
} from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";

type ConstructorParams = {
  entities: {
    appConfig: DynamoDbAppConfigEntity;
    channelConfigMapping: DynamoDbChannelConfigMappingEntity;
  };
  encryptor: Encryptor;
};

// todo create toolbox repo here
export class DynamodbAppConfigRepo implements AppConfigRepo {
  private logger = createLogger("DynamodbAppConfigRepo");

  channelConfigEntity: DynamoDbAppConfigEntity;
  channelConfigMappingEntity: DynamoDbChannelConfigMappingEntity;
  encryptor: Encryptor;

  constructor(
    config: ConstructorParams = {
      entities: {
        appConfig: DynamoDbAppConfig.entity,
        channelConfigMapping: DynamoDbChannelConfigMapping.entity,
      },
      encryptor: new Encryptor(),
    },
  ) {
    this.channelConfigMappingEntity = config.entities.channelConfigMapping;
    this.channelConfigEntity = config.entities.appConfig;
    this.encryptor = config.encryptor;
  }

  /**
   * Fetches twice - configs entity and mapping. These are queries. Looks like Toolbox (Dynamo?)
   * can't batch queries
   */
  async getRootConfig(
    access: BaseAccessPattern,
  ): Promise<Result<AppRootConfig, InstanceType<typeof BaseError>>> {
    const channelConfigToolboxRepo = this.channelConfigEntity.build(EntityRepository);
    const channelConfigMappingToolboxRepo = this.channelConfigMappingEntity.build(EntityRepository);

    const allConfigs = channelConfigToolboxRepo.batchGet();

    const allConfigsQuery = this.channelConfigEntity.table
      .build(QueryCommand)
      .entities(this.channelConfigEntity)
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
            if (dynamoItem.configId) {
              record[dynamoItem.channelId] = dynamoItem.configId;
            }

            return record;
          },
          {} as Record<string, string>,
        ),
        parsedConfigs.reduce(
          (record, dynamoItem) => {
            record[dynamoItem.configId] = this.mapRawDynamoConfigItemToConfigOrThrow(dynamoItem);

            return record;
          },
          {} as Record<string, AppChannelConfig>,
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

  private fetchStripeConfigByItsId(access: ConfigByConfigIdAccessPattern) {
    const query = this.channelConfigEntity.build(GetItemCommand).key({
      PK: DynamoDbStripeConfig.accessPattern.getPK(access),
      SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({
        configId: access.configId,
      }),
    });

    return query.send();
  }

  private fetchConfigIdFromChannelId(access: ConfigByChannelIdAccessPattern) {
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

    const configResult = AppChannelConfig.create({
      name: parsed.configName,
      restrictedKey: createStripeRestrictedKey(
        this.encryptor.decrypt(parsed.stripeRk),
      )._unsafeUnwrap(), // make it throwable
      webhookId: parsed.stripeWhId,
      id: parsed.configId,
      publishableKey: createStripePublishableKey(parsed.stripePk)._unsafeUnwrap(), // make it throwable
      webhookSecret: createStripeWebhookSecret(
        this.encryptor.decrypt(parsed.stripeWhSecret),
      )._unsafeUnwrap(), // make it throwable
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
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<AppChannelConfig | null, InstanceType<typeof BaseError>>> {
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
    config: AppChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }): Promise<Result<void | null, InstanceType<typeof AppConfigRepoError.FailureSavingConfig>>> {
    try {
      const command = this.channelConfigEntity.build(PutItemCommand).item({
        configId: config.id,
        stripePk: config.publishableKey,
        stripeRk: this.encryptor.encrypt(config.restrictedKey),
        stripeWhId: config.webhookId,
        stripeWhSecret: this.encryptor.encrypt(config.webhookSecret),
        PK: DynamoDbStripeConfig.accessPattern.getPK({ saleorApiUrl, appId }),
        SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({ configId: config.id }),
        configName: config.name,
      });

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
      configId: string | null;
      channelId: string;
    },
  ): Promise<Result<void | null, InstanceType<typeof BaseError>>> {
    const command = this.channelConfigMappingEntity.build(PutItemCommand).item({
      configId: data.configId ?? undefined,
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

  async removeConfig(
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ): Promise<Result<null, InstanceType<typeof AppConfigRepoError.FailureRemovingConfig>>> {
    try {
      const operation = this.channelConfigEntity.build(DeleteItemCommand).key({
        PK: DynamoDbStripeConfig.accessPattern.getPK(access),
        SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({
          configId: data.configId,
        }),
      });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new AppConfigRepoError.FailureRemovingConfig("Failed to remove config from DynamoDB", {
            props: {
              dynamoHttpResponseStatusCode: result.$metadata.httpStatusCode,
            },
          }),
        );
      }

      return ok(null);
    } catch (e) {
      return err(
        new AppConfigRepoError.FailureRemovingConfig("Failed to remove config from DynamoDB", {
          cause: e,
        }),
      );
    }
  }
}
