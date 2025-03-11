import { parseArgs } from "node:util";

import { DeleteItemCommand, QueryCommand } from "dynamodb-toolbox";
import { saleorApp } from "saleor-app";

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

  const appInstallations = await saleorApp.apl.getAll().catch(() => {
    console.error("Could not fetch instances from the APL");

    process.exit(1);
  });

  for (const { saleorApiUrl, appId } of appInstallations) {
    try {
      let lastEvaluatedKey: Record<string, unknown> | undefined = undefined;

      const command = logsTable
        .build(QueryCommand)
        .query({
          partition: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          lte: endDate,
        })
        .entities(logsByCheckoutOrOrderId, logsByDateEntity);

      if (values["dry-run"]) {
        console.log(`Would delete logs for ${saleorApiUrl}#${appId} lte: ${endDate.toISOString()}`);
        continue;
      }

      console.log(`Deleting logs for ${saleorApiUrl}#${appId} lte: ${endDate.toISOString()}`);

      do {
        const page = await command
          .options({
            limit: 100,
            exclusiveStartKey: lastEvaluatedKey,
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
      console.log(`Logs for ${saleorApiUrl}#${appId} deleted`);
    } catch (error) {
      console.error(`Could not delete logs for ${saleorApiUrl}#${appId}`, error);
    }
  }
  console.log(`Cleanup took ${performance.now() - start}ms`);
};

main();
