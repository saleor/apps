import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import {
  DeleteItemCommand,
  Entity,
  EntityParser,
  GetItemCommand,
  InputValue,
  item,
  Parser,
  PutItemCommand,
  QueryCommand,
  Schema,
  string,
  Table,
  ValidValue,
} from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { GenericRootConfig } from "./generic-root-config";
import { BaseAccessPattern, BaseConfig, GetChannelConfigAccessPattern } from "./types";

const RepoError = BaseError.subclass("DynamoConfigRepositoryError");

interface GenericRepo<ChannelConfig extends BaseConfig> {
  saveChannelConfig: (args: {
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof RepoError>>>;
  getChannelConfig: (
    access: GetChannelConfigAccessPattern,
  ) => Promise<Result<ChannelConfig | null, InstanceType<typeof RepoError>>>;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<Result<GenericRootConfig<ChannelConfig>, InstanceType<typeof RepoError>>>;
  removeConfig: (
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ) => Promise<Result<null, InstanceType<typeof RepoError>>>;
  updateMapping: (
    access: BaseAccessPattern,
    data: {
      configId: string | null;
      channelId: string;
    },
  ) => Promise<Result<void | null, InstanceType<typeof RepoError>>>;
}

type Settings<
  ChannelConfig extends BaseConfig,
  TEntity extends Entity = Entity,
  TSchema extends Schema = Schema,
> = {
  table: Table;
  configItem: {
    toolboxEntity: TEntity;
    entitySchema: TSchema;
    idAttr: string;
  };
  mapping: {
    singleDynamoItemToDomainEntity: (entity: ValidValue<TSchema>) => ChannelConfig;
    singleDomainEntityToDynamoItem: (
      config: ChannelConfig,
    ) => Omit<InputValue<TSchema>, "PK" | "SK">; // todo
  };
};

const mappingSchema = item({
  PK: string().key(),
  SK: string().key(),
  channelId: string(),
  configId: string().optional(),
});

const createMappingEntity = (table: Table, entityName = "DynamoConfigRepoMapping") =>
  // @ts-expect-error - Toolbox requires computeKey, but I don't know why. It should not
  new Entity({
    table,
    name: entityName,
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
    schema: mappingSchema,
  });

export class DynamoConfigRepository<
  ChannelConfig extends BaseConfig,
  TEntity extends Entity = Entity,
  TSchema extends Schema = Schema,
> implements GenericRepo<ChannelConfig>
{
  private settings: Settings<ChannelConfig, TEntity, TSchema>;
  mappingEntity: ReturnType<typeof createMappingEntity>;

  constructor(settings: Settings<ChannelConfig, TEntity, TSchema>) {
    this.settings = settings;
    this.mappingEntity = createMappingEntity(settings.table, "DynamoConfigRepoMapping");
  }

  private getPK({ saleorApiUrl, appId }: { saleorApiUrl: SaleorApiUrl; appId: string }) {
    return `${saleorApiUrl}#${appId}` as string;
  }

  private getSKforSpecificItem({ configId }: { configId: string }) {
    return `CONFIG_ID#${configId}` as const;
  }

  private getSKforAllItems() {
    return `CONFIG_ID#` as const;
  }

  private getSKforSpecificChannel({ channelId }: { channelId: string }) {
    return `CHANNEL_ID#${channelId}` as const;
  }

  private fetchConfigIdFromChannelId(access: ConfigByChannelIdAccessPattern) {
    const query = this.mappingEntity.build(GetItemCommand).key({
      PK: this.getPK(access),
      SK: this.getSKforSpecificChannel({
        channelId: access.channelId,
      }),
    });

    return query.send();
  }

  private fetchConfigByItsId(access: ConfigByConfigIdAccessPattern) {
    // @ts-expect-error - Toolbox is infering types based on specific keys, which we don't have access here
    const query = this.settings.configItem.toolboxEntity.build(GetItemCommand).key({
      PK: this.getPK({
        saleorApiUrl: access.saleorApiUrl,
        appId: access.appId,
      }),
      SK: this.getSKforSpecificItem({
        configId: access.configId,
      }),
    });

    return query.send();
  }

  async getChannelConfig(
    access: GetChannelConfigAccessPattern,
  ): Promise<Result<ChannelConfig | null, InstanceType<typeof RepoError>>> {
    const channelId = "channelId" in access ? access.channelId : undefined;
    /**
     * We eventually need config id, so it's mutable. It's either provided or will be resolved later and written here
     */
    let configId = "configId" in access ? access.configId : undefined;

    if (!configId && channelId) {
      const configIdResult = await this.fetchConfigIdFromChannelId({
        appId: access.appId,
        saleorApiUrl: access.saleorApiUrl,
        channelId,
      });

      if (!configIdResult.Item) {
        return ok(null);
      }

      const parsed = mappingSchema.build(Parser).parse(configIdResult.Item);

      configId = parsed.configId;
    }

    if (configId) {
      // todo error handling
      const result = await this.fetchConfigByItsId({
        appId: access.appId,
        saleorApiUrl: access.saleorApiUrl,
        configId,
      });

      if (!result.Item) {
        return ok(null);
      }

      const parsed = this.settings.configItem.toolboxEntity.build(EntityParser).parse(result.Item);

      return ok(
        this.settings.mapping.singleDynamoItemToDomainEntity(
          parsed.parsedItem as ValidValue<TSchema>,
        ),
      );
    }

    return err(
      new RepoError(
        "Invalid access pattern provided. Either channelId or configId must be provided.",
      ),
    );
  }

  async saveChannelConfig(args: {
    appId: string;
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    const mappedItem = this.settings.mapping.singleDomainEntityToDynamoItem(args.config);

    // @ts-expect-error - We can't infer types here
    const command = this.settings.configItem.toolboxEntity.build(PutItemCommand).item({
      PK: this.getPK({
        saleorApiUrl: args.saleorApiUrl,
        appId: args.appId,
      }),
      SK: this.getSKforSpecificItem({
        configId: args.config.id,
      }),
      ...mappedItem,
    });

    try {
      const result = await command.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new RepoError("Failed to save config", {
            props: {
              metadata: result.$metadata,
            },
          }),
        );
      }

      return ok(null);
    } catch (e) {
      return err(
        new RepoError("Failed to save config", {
          cause: e,
        }),
      );
    }
  }

  async removeConfig(
    access: BaseAccessPattern,
    data: { configId: string },
  ): Promise<Result<null, InstanceType<typeof RepoError>>> {
    try {
      // @ts-expect-error - Toolbox inference doesn't work here
      const operation = this.settings.configItem.toolboxEntity.build(DeleteItemCommand).key({
        PK: this.getPK({
          saleorApiUrl: access.saleorApiUrl,
          appId: access.appId,
        }),
        SK: this.getSKforSpecificItem({
          configId: data.configId,
        }),
      });

      const result = await operation.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new RepoError("Failed to remove config from DynamoDB", {
            props: {
              dynamoHttpResponseStatusCode: result.$metadata.httpStatusCode,
            },
          }),
        );
      }

      return ok(null);
    } catch (e) {
      return err(
        new RepoError("Failed to remove config from DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  async getRootConfig(
    access: BaseAccessPattern,
  ): Promise<Result<GenericRootConfig<ChannelConfig>, InstanceType<typeof RepoError>>> {
    const allConfigsQuery = this.settings.table
      .build(QueryCommand)
      .entities(this.settings.configItem.toolboxEntity, this.mappingEntity)
      .query({
        partition: this.getPK({
          appId: access.appId,
          saleorApiUrl: access.saleorApiUrl,
        }),
      })
      .options({ maxPages: Infinity, showEntityAttr: true });

    try {
      const result = await allConfigsQuery.send();

      const mappedConfigs = (result.Items ?? []).filter(
        // @ts-expect-error - "entity" field exists by showEntityAttr: true, but it's not properly inferred
        (item) => item.entity === this.settings.configItem.toolboxEntity.entityName,
      );
      const mappedMappings = (result.Items ?? []).filter(
        // @ts-expect-error - "entity" field exists by showEntityAttr: true, but it's not properly inferred
        (item) => item.entity === this.mappingEntity.entityName,
      );

      const rootConfig = new GenericRootConfig<ChannelConfig>({
        configsById: mappedConfigs.reduce(
          (acc, item) => {
            acc[item[this.settings.configItem.idAttr]] =
              this.settings.mapping.singleDynamoItemToDomainEntity(item as ValidValue<TSchema>);

            return acc;
          },
          {} as Record<string, ChannelConfig>,
        ),
        chanelConfigMapping: mappedMappings.reduce(
          (acc, item: ValidValue<typeof mappingSchema>) => {
            if (item.configId) {
              acc[item.channelId] = item.configId;
            }

            return acc;
          },
          {} as Record<string, string>,
        ),
      });

      return ok(rootConfig);
    } catch (e) {
      return err(
        new RepoError("Error fetching RootConfig from DynamoDB", {
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
  ): Promise<Result<void | null, InstanceType<typeof RepoError>>> {
    const command = this.mappingEntity.build(PutItemCommand).item({
      configId: data.configId ?? undefined,
      channelId: data.channelId,
      PK: this.getPK(access),
      SK: this.getSKforSpecificChannel({
        channelId: data.channelId,
      }),
    });

    try {
      const result = await command.send();

      if (result.$metadata.httpStatusCode !== 200) {
        return err(
          new RepoError("Failed to save config", {
            props: {
              metadata: result.$metadata,
            },
          }),
        );
      }

      return ok(null);
    } catch (e) {
      return err(
        new RepoError("Failed to update mapping in DynamoDB", {
          cause: e,
        }),
      );
    }
  }
}

export function createDynamoConfigRepository<
  ChannelConfig extends BaseConfig,
  TEntity extends Entity,
  TSchema extends Schema,
>(settings: Settings<ChannelConfig, TEntity, TSchema>) {
  return new DynamoConfigRepository(settings);
}
