import { EntityParser, EntityRepository, Parser, TableRepository } from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { Encryptor } from "@/lib/encryptor";
import { createLogger } from "@/lib/logger";
import { AppChannelConfig, AppRootConfig } from "@/modules/app-config/app-config";
import {
  DynamoDbAppConfig,
  DynamoDbAppConfigEntity,
} from "@/modules/app-config/repo/dynamodb/app-config-db-model";
import {
  DynamoDbChannelConfigMapping,
  DynamoDbChannelConfigMappingEntity,
} from "@/modules/app-config/repo/dynamodb/channel-config-mapping-db-model";
import { DynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

import { AppConfigRepo, AppConfigRepoError, BaseAccessPattern } from "../../types";

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
  ): Promise<Result<AppRootConfig, InstanceType<typeof AppConfigRepoError>>> {
    const mappingsRepo = this.channelConfigMappingEntity.build(EntityRepository);
    const configsRepo = this.channelConfigEntity.build(EntityRepository);

    try {
      const mappingsQuery = mappingsRepo.query({
        partition: DynamoMainTable.getPrimaryKeyScopedToInstallation({
          saleorApiUrl: access.saleorApiUrl,
          appId: access.appId,
        }),
      });

      const configsQuery = configsRepo.query({
        partition: DynamoMainTable.getPrimaryKeyScopedToInstallation({
          saleorApiUrl: access.saleorApiUrl,
          appId: access.appId,
        }),
      });

      const [mappings, configs] = await Promise.all([mappingsQuery, configsQuery]);

      const mappingsParsed = mappings.Items?.map((item) =>
        this.channelConfigMappingEntity.build(EntityParser).parse(item).parsedItem,
      );

      const configsParsed = configs.Items?.map((item) =>
        this.channelConfigEntity.build(EntityParser).parse(item).parsedItem,
      );

      const config = new AppRootConfig(
        mappingsParsed?.reduce((acc, item) => {
          acc[item.channelId]: item.configId

          return acc
        }, {}) ?? {},
        configsParsed?.reduce((acc, item) => {
          acc[item.configId]: AppChannelConfig.create()._unsafeUnwrap()

          return acc
        }, {}) ?? {}


      );

      return ok(config);
    } catch (e) {
      this.logger.error("Failed to fetch RootConfig from DynamoDB", { cause: e });

      return err(
        new AppConfigRepoError("Error fetching RootConfig from DynamoDB", {
          cause: e,
        }),
      );
    }
  }
}
