import { describe, expect, it } from "vitest";

import { bootstrapTest } from "./__test__/bootstrap-test";
import { DynamoConfigRepository } from "./base-repository";

describe("DynamoConfigRepository", () => {
  it("Should create", () => {
    const { table, toolboxEntity } = bootstrapTest();

    class AppChannelConfig {
      id: string;
      token: string;
      name: string;

      constructor(id: string, token: string) {
        this.id = id;
        this.token = token;
        this.name = token;
      }
    }

    const repo = new DynamoConfigRepository<AppChannelConfig>({
      table: table,
      configItem: {
        toolboxEntity,
      },
    });

    expect(repo).toBeDefined();
  });
});
