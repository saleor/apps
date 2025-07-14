import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { EntitySpy, GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
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
});
