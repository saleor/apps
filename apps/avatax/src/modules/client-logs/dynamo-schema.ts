import { type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, number, schema, string, Table } from "dynamodb-toolbox";
import { ulid } from "ulid";

import { clientLogsFeatureConfig } from "@/modules/client-logs/client-logs-feature-config";

export class LogsTable extends Table<
  {
    name: "PK";
    type: "string";
  },
  {
    name: "SK";
    type: "string";
  },
  {},
  "_et"
> {
  private constructor(
    params: ConstructorParameters<
      typeof Table<
        {
          name: "PK";
          type: "string";
        },
        {
          name: "SK";
          type: "string";
        },
        {},
        "_et"
      >
    >[0],
  ) {
    super(params);
  }

  static create({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }) {
    return new LogsTable({
      documentClient,
      name: tableName,
      partitionKey: {
        name: "PK",
        type: "string",
      },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }

  static getPrimaryKey({ saleorApiUrl, appId }: { saleorApiUrl: string; appId: string }) {
    return `${saleorApiUrl}#${appId}`;
  }

  static getDefaultTTL() {
    const daysUntilExpire = clientLogsFeatureConfig.ttlInDays;
    const today = new Date();

    // Add today + days until expire, export to UNIX epoch timestamp
    return new Date(today.setDate(today.getDate() + daysUntilExpire)).getTime();
  }
}

export const baseLogSchema = schema({
  PK: string().key(),
  // SK: sort key is added by adequate entity schema
  ulid: string()
    .key()
    .default(() => ulid()),
  /**
   * Logs level are using ts-log default mapping
   *- 0 -> silly
   *- 1 -> trace
   *- 2 -> debug
   *- 3 -> info
   *- 4 -> warn
   *- 5 -> error
   *- 6 -> fatal
   */
  level: number().enum(0, 1, 2, 3, 4, 5, 6).required(),
  attributes: string(),
  message: string().required(),
  TTL: number()
    .required()
    .default(() => LogsTable.getDefaultTTL()),
  // checkoutOrOrderId is added by entity schema
  transactionId: string().optional(),
  channelId: string().optional(),
  date: string()
    .required()
    .default(() => new Date().toISOString())
    .key(),
  checkoutOrOrder: string().required(),
});

export const ClientLogDynamoSchema = {
  logByCheckoutOrOrderId: baseLogSchema
    .and(() => ({
      checkoutOrOrderId: string().key(),
    }))
    .and((prevSchema) => ({
      SK: string()
        .key()
        .link<typeof prevSchema>(({ checkoutOrOrderId, ulid }) => `${checkoutOrOrderId}#${ulid}`),
    })),

  logByDate: baseLogSchema.and((prevSchema) => ({
    checkoutOrOrderId: string().optional(),
    SK: string()
      .key()
      .link<typeof prevSchema>(({ date, ulid }) => `${date}#${ulid}`),
  })),
};

export const ClientLogDynamoEntityFactory = {
  createLogByCheckoutOrOrderId: (logsTable: LogsTable) => {
    return new Entity({
      table: logsTable,
      schema: ClientLogDynamoSchema.logByCheckoutOrOrderId,
      name: "LOG_BY_CHECKOUT_OR_ORDER_ID",
      timestamps: false,
    });
  },

  createLogByDate: (logsTable: LogsTable) => {
    return new Entity({
      table: logsTable,
      schema: ClientLogDynamoSchema.logByDate,
      name: "LOG_BY_DATE",
      timestamps: false,
    });
  },
};

export type LogByCheckoutOrOrderIdEntity = ReturnType<
  typeof ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId
>;
export type LogByDateEntity = ReturnType<typeof ClientLogDynamoEntityFactory.createLogByDate>;
