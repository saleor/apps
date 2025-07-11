import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Entity, Table } from "dynamodb-toolbox";
import { Result } from "neverthrow";

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

interface GenericRepo<ChannelConfig> {
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

type Settings = {
  table: Table;
  configItem: {
    toolboxEntity: Entity;
  };
};

class BaseRepository<ChannelConfig> implements GenericRepo<ChannelConfig> {
  private settings: Settings;

  constructor(settings: Settings) {}
}
