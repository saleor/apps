import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { createDynamoConfigRepository } from "@saleor/dynamo-config-repository";
import { Entity, item, string } from "dynamodb-toolbox";

import { dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

const schema = item({
  PK: string().key(),
  SK: string().key(),
  configName: string(),
  configId: string(),
  token: string(),
});
const entity = new Entity({
  table: dynamoMainTable,
  schema,
  name: "ATOBARAI_CONFIG",
});

const repo = createDynamoConfigRepository({
  table: dynamoMainTable,
  configItem: {
    toolboxEntity: entity,
    entitySchema: schema,
    idAttr: "configId",
  },
  mapping: {
    singleDynamoItemToDomainEntity(e) {
      return {
        configName: e.configName,
        id: e.configId,
        token: e.token,
      };
    },
    singleDomainEntityToDynamoItem(item) {
      return {
        configId: item.id,
        token: item.token,
        configName: item.configName,
      };
    },
  },
});

export const createConfig = async () => {
  const result = await repo.saveChannelConfig({
    appId: "test-app",
    saleorApiUrl: createSaleorApiUrl("https://test.saleor.cloud/graphql/"),
    config: {
      configName: "test",
      token: "test",
      id: "test",
    },
  });
};

export const getConfig = async () => {
  return repo.getChannelConfig({
    appId: "test-app",
    saleorApiUrl: createSaleorApiUrl("https://test.saleor.cloud/graphql/"),
    configId: "test",
  });
};

export const setMapping = async () => {
  return repo.updateMapping(
    {
      appId: "test-app",
      saleorApiUrl: createSaleorApiUrl("https://test.saleor.cloud/graphql/"),
    },
    {
      configId: "test",
      channelId: "c1-",
    },
  );
};

export const getRoot = async () => {
  return repo.getRootConfig({
    appId: "test-app",
    saleorApiUrl: createSaleorApiUrl("https://test.saleor.cloud/graphql/"),
  });
};
