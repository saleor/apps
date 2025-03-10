import { parseArgs } from "node:util";

import { DeletePartitionCommand } from "dynamodb-toolbox/table/actions/deletePartition";
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

const startDate = new Date(2024, 1, 1);
const endDate = new Date(2025, 2, 24); // 14 days from today

const main = async () => {
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
    const command = logsTable
      .build(DeletePartitionCommand)
      .entities(logsByCheckoutOrOrderId, logsByDateEntity)
      .query({
        partition: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
        range: {
          between: [startDate.toISOString(), endDate.toISOString()],
        },
      });

    try {
      if (values["dry-run"]) {
        console.log(`Would delete logs for ${saleorApiUrl}#${appId}`);
        continue;
      }
      console.log(`Deleting logs for ${saleorApiUrl}#${appId}`);
      await command.send();
      console.log(`Logs for ${saleorApiUrl}#${appId} deleted`);
    } catch (error) {
      console.error(`Could not delete logs for ${saleorApiUrl}#${appId}`, error);
    }
  }
};

main();
