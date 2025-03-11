import { parseArgs } from "node:util";

import { DeleteItemCommand, ScanCommand } from "dynamodb-toolbox";

import { env } from "@/env";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-schema";

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", short: "d" },
  },
});

const today = new Date();
const endDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days from today

const main = async () => {
  const start = performance.now();

  const dynamoClient = createLogsDynamoClient();

  const logsTable = LogsTable.create({
    documentClient: createLogsDocumentClient(dynamoClient),
    tableName: env.DYNAMODB_LOGS_TABLE_NAME,
  });

  const logsByCheckoutOrOrderId =
    ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);
  const logsByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);

  try {
    let lastEvaluatedKey: Record<string, unknown> | undefined = undefined;

    const command = logsTable
      .build(ScanCommand)
      .entities(logsByCheckoutOrOrderId, logsByDateEntity);

    if (values["dry-run"]) {
      console.log(`Would delete logs for lte: ${endDate.toISOString()}`);
      return;
    }

    console.log(`Deleting logs for lte: ${endDate.toISOString()}`);

    do {
      const page = await command
        .options({
          limit: 100,
          exclusiveStartKey: lastEvaluatedKey,
          filters: {
            LOG_BY_CHECKOUT_OR_ORDER_ID: {
              attr: "date",
              lte: endDate.toISOString(),
            },
            LOG_BY_DATE: {
              attr: "date",
              lte: endDate.toISOString(),
            },
          },
        })
        .send();

      for (const item of page?.Items ?? []) {
        if (item.checkoutOrOrderId) {
          await logsByCheckoutOrOrderId
            .build(DeleteItemCommand)
            .key({
              PK: item.PK,
              SK: item.SK,
              checkoutOrOrderId: item.checkoutOrOrderId,
              date: item.date,
            })
            .send();
        } else {
          await logsByDateEntity
            .build(DeleteItemCommand)
            .key({
              PK: item.PK,
              SK: item.SK,
              date: item.date,
            })
            .send();
        }
      }
      lastEvaluatedKey = page.LastEvaluatedKey;
    } while (lastEvaluatedKey !== undefined);
    console.log(`Logs deleted`);
  } catch (error) {
    console.error(`Could not delete logs`, error);
  }
  console.log(`Cleanup took ${performance.now() - start}ms`);
};

main();
