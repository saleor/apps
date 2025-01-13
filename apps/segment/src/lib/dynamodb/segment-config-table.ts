import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, schema, string, Table } from "dynamodb-toolbox";

import { createDynamoDBClient, createDynamoDBDocumentClient } from "./dynamodb-client";

export class SegmentConfigTable extends Table<
  { name: "PK"; type: "string" },
  {
    name: "SK";
    type: "string";
  }
> {
  private constructor(
    args: ConstructorParameters<
      typeof Table<
        { name: "PK"; type: "string" },
        {
          name: "SK";
          type: "string";
        }
      >
    >[number],
  ) {
    super(args);
  }

  static create({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }): SegmentConfigTable {
    return new SegmentConfigTable({
      documentClient,
      name: tableName,
      partitionKey: { name: "PK", type: "string" },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }

  static getAPLPrimaryKey({ appManifestId }: { appManifestId: string }) {
    return `${appManifestId}` as const;
  }

  static getAPLSortKey({ saleorApiUrl }: { saleorApiUrl: string }) {
    return `APL#${saleorApiUrl}` as const;
  }

  static getConfigPrimaryKey({ saleorApiUrl, appId }: { saleorApiUrl: string; appId: string }) {
    return `${saleorApiUrl}#${appId}` as const;
  }

  static getConfigSortKey({ configKey }: { configKey: string }) {
    return `APP_CONFIG#${configKey}` as const;
  }
}

const SegmentConfigTableSchema = {
  apl: schema({
    PK: string().key(),
    SK: string().key(),
    domain: string().optional(),
    token: string(),
    saleorApiUrl: string(),
    appId: string(),
    jwks: string().optional(),
  }),
  config: schema({
    PK: string().key(),
    SK: string().key(),
    value: string(),
  }),
};

export const client = createDynamoDBClient();

export const documentClient = createDynamoDBDocumentClient(client);

export const SegmentConfigTableEntityFactory = {
  createAPLEntity: (table: SegmentConfigTable) => {
    return new Entity({
      table,
      name: "APL",
      schema: SegmentConfigTableSchema.apl,
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
  },
  createConfigEntity: (table: SegmentConfigTable) => {
    return new Entity({
      table,
      name: "Config",
      schema: SegmentConfigTableSchema.config,
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
  },
};

export type SegmentAPLEntity = ReturnType<typeof SegmentConfigTableEntityFactory.createAPLEntity>;
export type SegmentConfigEntity = ReturnType<
  typeof SegmentConfigTableEntityFactory.createConfigEntity
>;
