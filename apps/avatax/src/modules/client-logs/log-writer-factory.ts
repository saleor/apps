import { env } from "@/env";
import { BaseError } from "@/error";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-logs-table";
import { DynamoDbLogWriter, ILogWriter, LogWriterContext } from "@/modules/client-logs/log-writer";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";
import { createDocumentClient, createDynamoClient } from "@/modules/dynamodb/dynamo-client";

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
      const dynamoClient = createDynamoClient({
        connectionTimeout: env.DYNAMODB_CONNECTION_TIMEOUT_MS,
        requestTimeout: env.DYNAMODB_REQUEST_TIMEOUT_MS,
      });
      const logsTable = LogsTable.create({
        documentClient: createDocumentClient(dynamoClient),
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
