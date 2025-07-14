import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { EntitySpy, GetItemCommand } from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { bootstrapTest } from "./__test__/bootstrap-test";
import { createDynamoConfigRepository } from "./base-repository";

class AppChannelConfig {
  id: string;
  token: string;
  name: string;

  constructor(id: string, name: string, token: string) {
    this.id = id;
    this.token = token;
    this.name = name;
  }
}

describe("DynamoConfigRepository", () => {
  it("Should create", () => {
    const { table, toolboxEntity, toolboxSchema } = bootstrapTest();

    const repo = createDynamoConfigRepository({
      table: table,
      configItem: {
        toolboxEntity,
        entitySchema: toolboxSchema,
      },
      mapping: {
        singleDynamoItemToDomainEntity(entity) {
          return new AppChannelConfig(entity.configId, entity.configName, entity.token);
        },
        singleDomainEntityToDynamoItem(channelConfig) {
          return {};
        },
      },
    });

    expect(repo).toBeDefined();
  });

  it("Should fetch by ID", async () => {
    const { table, toolboxEntity, toolboxSchema } = bootstrapTest();

    const entitySpy = toolboxEntity.build(EntitySpy);

    entitySpy.on(GetItemCommand).resolve({
      Item: {
        configId: "1",
        PK: "https://google.com/graphql/",
        SK: "CONFIG#1",
        configName: "test 1",
        token: "asd",
        modifiedAt: "",
        createdAt: "",
      },
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const repo = createDynamoConfigRepository({
      table: table,
      configItem: {
        toolboxEntity,
        entitySchema: toolboxSchema,
      },
      mapping: {
        singleDynamoItemToDomainEntity(entity) {
          console.log(entity);

          return new AppChannelConfig(entity.configId, entity.configName, entity.token);
        },
        singleDomainEntityToDynamoItem(channelConfig) {
          return {};
        },
      },
    });

    const result = await repo.getChannelConfig({
      saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
      appId: "app-id",
      configId: "1",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      AppChannelConfig {
        "id": "1",
        "name": "test 1",
        "token": "asd",
      }
    `);
  });

  it("Should fetch by channel ID", async () => {
    const { table, toolboxEntity, toolboxSchema } = bootstrapTest();

    const entitySpy = toolboxEntity.build(EntitySpy);

    entitySpy.on(GetItemCommand).resolve({
      Item: {
        configId: "1",
        PK: "https://google.com/graphql/",
        SK: "CONFIG#1",
        configName: "test 1",
        token: "asd",
        modifiedAt: "",
        createdAt: "",
      },
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const repo = createDynamoConfigRepository({
      table: table,
      configItem: {
        toolboxEntity,
        entitySchema: toolboxSchema,
      },
      mapping: {
        singleDynamoItemToDomainEntity(entity) {
          console.log(entity);

          return new AppChannelConfig(entity.configId, entity.configName, entity.token);
        },
        singleDomainEntityToDynamoItem(channelConfig) {
          return {
            configId: channelConfig.id,
            token: channelConfig.token,
            configName: channelConfig.name,
          };
        },
      },
    });

    const mappingSpy = repo.mappingEntity.build(EntitySpy);

    mappingSpy.on(GetItemCommand).resolve({
      $metadata: {
        httpStatusCode: 200,
      },
      Item: {
        PK: "https://google.com/graphql/",
        SK: "CHANNEL_ID#channel-1",
        channelId: "channel-1",
        configId: "1",
      },
    });

    const result = await repo.getChannelConfig({
      saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
      appId: "app-id",
      channelId: "channel-1",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      AppChannelConfig {
        "id": "1",
        "name": "test 1",
        "token": "asd",
      }
    `);
  });
});
