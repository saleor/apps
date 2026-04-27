import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { env } from "@/env";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-logs-table";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";
import { createDocumentClient, createDynamoClient } from "@/modules/dynamodb/dynamo-client";

import { saleorApp } from "../../../../../saleor-app";
import { createLogger } from "../../../../logger";

const { handler, getWebhookManifest } = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger: createLogger("APP_DELETED handler"),
  webhookPath: "api/webhooks/app-deleted",
  hooks: {
    async onEvent({ authData }) {
      const logsTable = LogsTable.create({
        documentClient: createDocumentClient(
          createDynamoClient({
            connectionTimeout: env.DYNAMODB_CONNECTION_TIMEOUT_MS,
            requestTimeout: env.DYNAMODB_REQUEST_TIMEOUT_MS,
          }),
        ),
        tableName: env.DYNAMODB_LOGS_TABLE_NAME,
      });
      const logByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);
      const logByCheckoutOrOrderId =
        ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);

      const repo = new LogsRepositoryDynamodb({
        logsTable,
        logByDateEntity,
        logByCheckoutOrOrderId,
      });

      await repo.pruneAllLogs({ saleorApiUrl: authData.saleorApiUrl });
    },
  },
});

export { getWebhookManifest, handler };
