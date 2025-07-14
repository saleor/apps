import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import {
  Entity,
  EntityFormatter,
  FormattedValue,
  GetItemCommand,
  InputValue,
  item,
  Parser,
  PutItemCommand,
  Schema,
  string,
  Table,
} from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

type ConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

type ConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

type GetChannelConfigAccessPattern = ConfigByChannelIdAccessPattern | ConfigByConfigIdAccessPattern;

class GenericRootConfig<ChannelConfig> {
  readonly chanelConfigMapping: Record<string, string>;
  readonly configsById: Record<string, ChannelConfig>;

  constructor({
    chanelConfigMapping,
    configsById,
  }: {
    chanelConfigMapping: Record<string, string>;
    configsById: Record<string, ChannelConfig>;
  }) {
    this.chanelConfigMapping = chanelConfigMapping;
    this.configsById = configsById;
  }

  getAllConfigsAsList() {
    return Object.values(this.configsById);
  }

  getChannelsBoundToGivenConfig(configId: string) {
    const keyValues = Object.entries(this.chanelConfigMapping);
    const filtered = keyValues.filter(([_, value]) => value === configId);

    return filtered.map(([channelId]) => channelId);
  }

  getConfigByChannelId(channelId: string) {
    return this.configsById[this.chanelConfigMapping[channelId]];
  }

  getConfigById(configId: string) {
    return this.configsById[configId];
  }
}

export interface BaseConfig {
  id: string;
}

const RepoError = BaseError.subclass("DynamoConfigRepositoryError");

interface GenericRepo<ChannelConfig extends BaseConfig> {
  saveChannelConfig: (args: {
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, Error>>;
  getChannelConfig: (
    access: GetChannelConfigAccessPattern,
  ) => Promise<Result<ChannelConfig | null, Error>>;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<Result<GenericRootConfig<ChannelConfig>, Error>>;
  removeConfig: (
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ) => Promise<Result<null, Error>>;
  updateMapping: (
    access: BaseAccessPattern,
    data: {
      configId: string | null;
      channelId: string;
    },
  ) => Promise<Result<void | null, Error>>;
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
  };
  mapping: {
    singleDynamoItemToDomainEntity: (entity: FormattedValue<TSchema>) => ChannelConfig;
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
    // ????
    computeKey: () => ({}),
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
  ): Promise<Result<ChannelConfig | null, Error>> {
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

      const parsed = this.settings.configItem.toolboxEntity
        .build(EntityFormatter)
        .format(result.Item);

      return ok(
        this.settings.mapping.singleDynamoItemToDomainEntity(parsed as FormattedValue<TSchema>),
      );
    }

    return err(
      new Error("Invalid access pattern provided. Either channelId or configId must be provided."),
    );
  }

  async saveChannelConfig(args: {
    appId: string;
    config: ChannelConfig;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<void | null, Error>> {
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
}

export function createDynamoConfigRepository<
  ChannelConfig extends BaseConfig,
  TEntity extends Entity,
  TSchema extends Schema,
>(settings: Settings<ChannelConfig, TEntity, TSchema>) {
  return new DynamoConfigRepository(settings);
}
