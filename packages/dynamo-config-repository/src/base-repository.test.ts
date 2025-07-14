import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import {
  DeleteItemCommand,
  EntitySpy,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  TableSpy,
} from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { bootstrapTest } from "./__test__/bootstrap-test";
import { createDynamoConfigRepository } from "./base-repository";

describe("DynamoConfigRepository", () => {
  it("Should create", () => {
    const { repo } = bootstrapTest();

    expect(repo).toBeDefined();
  });

  describe("getChannelConfig", () => {
    it("Should fetch by ID", async () => {
      const { toolboxEntity, repo } = bootstrapTest();

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
      const { toolboxEntity, repo } = bootstrapTest();

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

  describe("saveChannelConfig", () => {
    it("Saves item", async () => {
      expect.assertions(2);

      const { repo, toolboxEntity, AppChannelConfig } = bootstrapTest();

      const entitySpy = toolboxEntity.build(EntitySpy);

      // @ts-expect-error - testing
      entitySpy.on(PutItemCommand).mock(async (entity) => {
        expect(entity).toStrictEqual({
          PK: "https://google.com/graphql/#app-id",
          SK: "CONFIG_ID#id",
          configId: "id",
          token: "token",
          configName: "name",
        });

        return {
          $metadata: {
            httpStatusCode: 200,
          },
          ToolboxItem: {
            ...entity,
            createdAt: "",
            modifiedAt: "",
          },
        };
      });

      const result = await repo.saveChannelConfig({
        appId: "app-id",
        saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
        config: new AppChannelConfig("id", "name", "token"),
      });

      expect(result.isOk()).toBe(true);
    });

    it("Saves item with custom mapping", async () => {
      expect.assertions(2);

      const { toolboxEntity, AppChannelConfig, toolboxSchema, table } = bootstrapTest();

      const encrypt = (token: string) => `encrypted-${token}`;
      const decrypt = (token: string) => token.replace("encrypted-", "");

      const repo = createDynamoConfigRepository({
        table: table,
        configItem: {
          toolboxEntity,
          entitySchema: toolboxSchema,
          idAttr: "id",
        },
        mapping: {
          singleDynamoItemToDomainEntity(entity) {
            return new AppChannelConfig(entity.configId, entity.configName, decrypt(entity.token));
          },
          singleDomainEntityToDynamoItem(channelConfig) {
            return {
              configId: channelConfig.id,
              token: encrypt(channelConfig.token),
              configName: channelConfig.name,
            };
          },
        },
      });

      const entitySpy = toolboxEntity.build(EntitySpy);

      // @ts-expect-error - testing
      entitySpy.on(PutItemCommand).mock(async (entity) => {
        expect(entity.token).toStrictEqual("encrypted-token");

        return {
          $metadata: {
            httpStatusCode: 200,
          },
          ToolboxItem: {
            ...entity,
            createdAt: "",
            modifiedAt: "",
          },
        };
      });

      const result = await repo.saveChannelConfig({
        appId: "app-id",
        saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
        config: new AppChannelConfig("id", "name", "token"),
      });

      expect(result.isOk()).toBe(true);
    });
  });

  describe("remove config", () => {
    it("Should remove config by ID", async () => {
      expect.assertions(2);
      const { repo, toolboxEntity } = bootstrapTest();
      const entitySpy = toolboxEntity.build(EntitySpy);

      entitySpy.on(DeleteItemCommand).mock(async (entity) => {
        expect(entity).toStrictEqual({
          PK: "https://google.com/graphql/#app-id",
          SK: "CONFIG_ID#id",
        });

        return {
          $metadata: { httpStatusCode: 200 },
        };
      });
      const result = await repo.removeConfig(
        {
          appId: "app-id",
          saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
        },
        { configId: "id" },
      );

      expect(result.isOk()).toBe(true);
    });
  });

  describe("getRootConfig", () => {
    it("Should return RootConfig instance with pre-filled values", async () => {
      const { repo, toolboxEntity, table, AppChannelConfig } = bootstrapTest();
      const querySpy = table.build(TableSpy);

      querySpy.on(QueryCommand).resolve({
        Items: [
          {
            entity: toolboxEntity.entityName,
            configId: "1",
            configName: "test 1",
            token: "asd",
            PK: "https://google.com/graphql/#app-id",
            SK: "CONFIG_ID#1",
            createdAt: "",
            modifiedAt: "",
          },
          {
            entity: repo.mappingEntity.entityName,
            PK: "https://google.com/graphql/#app-id",
            SK: "CHANNEL_ID#channel-1",
            channelId: "channel-1",
            configId: "1",
          },
        ],
        $metadata: { httpStatusCode: 200 },
      });
      const result = await repo.getRootConfig({
        appId: "app-id",
        saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
      });
      const rootConfig = result._unsafeUnwrap();

      expect(rootConfig.configsById["1"]).toStrictEqual(new AppChannelConfig("1", "test 1", "asd"));
      expect(rootConfig.chanelConfigMapping["channel-1"]).toBe("1");
    });
  });

  describe("updateMapping", () => {
    it("Should call DB with correct value to update ID", async () => {
      expect.assertions(2);
      const { repo } = bootstrapTest();
      const mappingSpy = repo.mappingEntity.build(EntitySpy);

      // @ts-expect-error - testing
      mappingSpy.on(PutItemCommand).mock(async (entity) => {
        expect(entity).toMatchObject({
          PK: "https://google.com/graphql/#app-id",
          SK: "CHANNEL_ID#channel-1",
          channelId: "channel-1",
          configId: "id",
        });

        return { $metadata: { httpStatusCode: 200 } };
      });
      const result = await repo.updateMapping(
        {
          appId: "app-id",
          saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
        },
        { channelId: "channel-1", configId: "id" },
      );

      expect(result.isOk()).toBe(true);
    });

    it("Should call DB with null value to remove mapping", async () => {
      expect.assertions(2);
      const { repo } = bootstrapTest();
      const mappingSpy = repo.mappingEntity.build(EntitySpy);

      // @ts-expect-error - testing
      mappingSpy.on(PutItemCommand).mock(async (entity) => {
        expect(entity).toMatchObject({
          PK: "https://google.com/graphql/#app-id",
          SK: "CHANNEL_ID#channel-1",
          channelId: "channel-1",
          configId: undefined,
        });

        return { $metadata: { httpStatusCode: 200 } };
      });
      const result = await repo.updateMapping(
        {
          appId: "app-id",
          saleorApiUrl: createSaleorApiUrl("https://google.com/graphql/"),
        },
        { channelId: "channel-1", configId: null },
      );

      expect(result.isOk()).toBe(true);
    });
  });
});
