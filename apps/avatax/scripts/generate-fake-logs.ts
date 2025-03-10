import { faker } from "@faker-js/faker";
import { saleorApp } from "saleor-app";

import { env } from "@/env";
import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-schema";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";

const logCount = 1000;

const main = async () => {
  const dynamoClient = createLogsDynamoClient();

  const logsTable = LogsTable.create({
    documentClient: createLogsDocumentClient(dynamoClient),
    tableName: env.DYNAMODB_LOGS_TABLE_NAME,
  });

  const appInstallations = await saleorApp.apl.getAll().catch(() => {
    console.error("Could not fetch instances from the APL");

    process.exit(1);
  });

  const repository = new LogsRepositoryDynamodb({
    logsTable,
    logByCheckoutOrOrderId: ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable),
    logByDateEntity: ClientLogDynamoEntityFactory.createLogByDate(logsTable),
  });

  for (const { saleorApiUrl, appId } of appInstallations) {
    for (let i = 0; i < logCount; i++) {
      const clientLog = ClientLogStoreRequest.create({
        checkoutOrOrderId: faker.string.uuid(),
        date: faker.date
          .between({ from: new Date(2024, 1, 1), to: new Date(2025, 3, 24) })
          .toISOString(),
        message: faker.lorem.sentence(),
        level: "info",
        checkoutOrOrder: "checkout",
      })._unsafeUnwrap();

      try {
        await repository.writeLog({
          saleorApiUrl,
          appId,
          clientLogRequest: clientLog,
        });
        console.log(`Created log entry for ${saleorApiUrl}#${appId}`);
      } catch (error) {
        console.error(`Could not create log entry for ${saleorApiUrl}#${appId}`, error);
      }
    }
  }
};

main();
