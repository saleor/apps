import { BatchGetCommand, PutItemCommand } from "dynamodb-toolbox";
import { execute } from "dynamodb-toolbox/table/actions/batchGet";
import { QueryCommand } from "dynamodb-toolbox/table/actions/query";
import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
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
  ChannelConfigMappingEntity,
} from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import {
  DynamoDbStripeConfigEntity,
  StripeConfigAccessPattern,
} from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export class DynamodbAppConfigRepo implements AppConfigRepo {
  stripeConfig: DynamoDbStripeConfigEntity;
  channelConfigMapping: ChannelConfigMappingEntity;

  constructor(config: {
    entities: {
      stripeConfig: DynamoDbStripeConfigEntity;
      channelConfigMapping: ChannelConfigMappingEntity;
    };
  }) {
    this.channelConfigMapping = config.entities.channelConfigMapping;
    this.stripeConfig = config.entities.stripeConfig;
  }

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
        }).options({ maxPages: Infinity }),
      });

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
        }).options({ maxPages: Infinity }),
      });

    const batchQuery = this.stripeConfig.table
      .build(BatchGetCommand)
      .requests(allConfigsQuery, allMappingsQuery);

    try {
      const { Responses } = await execute(batchQuery);

      const [configs, mappings] = Responses;

      console.log(configs, mappings);
    } catch (e) {}

    return Promise.resolve(undefined);
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
      SK: StripeConfigAccessPattern.getSKforSpecificItem({ configId }),
    });

    try {
      const response = await command.send();

      // check how to best ensure if it was success
      console.log(response);

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
