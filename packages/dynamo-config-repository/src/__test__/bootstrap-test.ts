import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, item, string, Table } from "dynamodb-toolbox";

import { BaseConfig, createDynamoConfigRepository } from "../base-repository";

class AppChannelConfig implements BaseConfig {
  id: string;
  token: string;
  name: string;

  constructor(id: string, name: string, token: string) {
    this.id = id;
    this.token = token;
    this.name = name;
  }
}

export const bootstrapTest = () => {
  const client = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(client);
  const table = new Table({
    documentClient,
    name: "Test table",
    partitionKey: { name: "PK", type: "string" },
    sortKey: {
      name: "SK",
      type: "string",
    },
  });

  const toolboxSchema = item({
    PK: string().key(),
    SK: string().key(),
    configName: string(),
    configId: string(),
    token: string(),
  });

  const toolboxEntity = new Entity({
    table,
    name: "TestConfigEntity",
    schema: toolboxSchema,
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
  });

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
        return {
          configId: channelConfig.id,
          token: channelConfig.token,
          configName: channelConfig.name,
        };
      },
    },
  });

  return { table, toolboxEntity, toolboxSchema, repo, AppChannelConfig };
};
