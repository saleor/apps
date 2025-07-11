import { describe, expect, it } from "vitest";

import { bootstrapTest } from "./__test__/bootstrap-test";
import { createDynamoConfigRepository } from "./base-repository";

describe("DynamoConfigRepository", () => {
  it("Should create", () => {
    const { table, toolboxEntity, toolboxSchema } = bootstrapTest();

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
});
