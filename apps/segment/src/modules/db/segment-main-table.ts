import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, schema, string, Table } from "dynamodb-toolbox";

import { env } from "@/env";
import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/lib/dynamodb-client";

type PartitionKey = { name: "PK"; type: "string" };
type SortKey = { name: "SK"; type: "string" };

/**
 * This table is used to store all relevant data for the Segment application meaning: APL, configuration, etc.
 */
export class SegmentMainTable extends Table<PartitionKey, SortKey> {
  private constructor(args: ConstructorParameters<typeof Table<PartitionKey, SortKey>>[number]) {
    super(args);
  }

  static create({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }): SegmentMainTable {
    return new SegmentMainTable({
      documentClient,
      name: tableName,
      partitionKey: { name: "PK", type: "string" },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }

  static getAPLPrimaryKey({ saleorApiUrl }: { saleorApiUrl: string }) {
    return `${saleorApiUrl}` as const;
  }

  static getAPLSortKey() {
    return `APL` as const;
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

export const segmentMainTable = SegmentMainTable.create({
  tableName: env.DYNAMODB_MAIN_TABLE_NAME,
  documentClient,
});

export const SegmentMainTableEntityFactory = {
  createAPLEntity: (table: SegmentMainTable) => {
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
  createConfigEntity: (table: SegmentMainTable) => {
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

export type SegmentAPLEntityType = ReturnType<typeof SegmentMainTableEntityFactory.createAPLEntity>;
export type SegmentConfigEntityType = ReturnType<
  typeof SegmentMainTableEntityFactory.createConfigEntity
>;
