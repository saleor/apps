import { env } from "@/env";
import { BaseError } from "@/error";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-schema";
import { DynamoDbLogWriter, ILogWriter, LogWriterContext } from "@/modules/client-logs/log-writer";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";

export interface ILogWriterFactory {
  createWriter(context: LogWriterContext): ILogWriter;
}

/**
 * Depending on static config, create an ILogWriter instance
 */
export class LogWriterFactory implements ILogWriterFactory {
  static ErrorCreatingLogWriterError = BaseError.subclass("ErrorCreatingLogWriterError");

  private createDynamoDbWriter(context: LogWriterContext): ILogWriter {
    try {
      const dynamoClient = createLogsDynamoClient();
      const logsTable = LogsTable.create({
        documentClient: createLogsDocumentClient(dynamoClient),
        tableName: env.DYNAMODB_LOGS_TABLE_NAME,
      });
      const repository = new LogsRepositoryDynamodb({
        logsTable,
        logByCheckoutOrOrderId:
          ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable),
        logByDateEntity: ClientLogDynamoEntityFactory.createLogByDate(logsTable),
      });

      return new DynamoDbLogWriter(repository, context);
    } catch (e) {
      throw new LogWriterFactory.ErrorCreatingLogWriterError("Failed to create DynamoDbLogWriter", {
        cause: e,
      });
    }
  }

  createWriter(context: LogWriterContext): ILogWriter {
    return this.createDynamoDbWriter(context);
  }
}
