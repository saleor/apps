import { clientLogsFeatureConfig } from "@/modules/client-logs/client-logs-feature-config";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import { ClientLogDynamoEntityFactory, LogsTable } from "@/modules/client-logs/dynamo-schema";
import {
  DynamoDbLogWriter,
  ILogWriter,
  LogWriterContext,
  NoopLogWriter,
} from "@/modules/client-logs/log-writer";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";

export interface ILogWriterFactory {
  createWriter(context: LogWriterContext): ILogWriter;
}

/**
 * Depending on static config, create an ILogWriter instance
 */
export class LogWriterFactory implements ILogWriterFactory {
  private createDynamoDbWriter(context: LogWriterContext): ILogWriter {
    const dynamoClient = createLogsDynamoClient();
    const logsTable = LogsTable.create({
      documentClient: createLogsDocumentClient(dynamoClient),
      tableName: clientLogsFeatureConfig.dynamoTableName!, // If not set, it will throw earlier
    });
    const repository = new LogsRepositoryDynamodb({
      logsTable,
      logByCheckoutOrOrderId: ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable),
      logByDateEntity: ClientLogDynamoEntityFactory.createLogByDate(logsTable),
    });

    return new DynamoDbLogWriter(repository, context);
  }

  private createNoopWriter(): ILogWriter {
    return new NoopLogWriter();
  }

  createWriter(context: LogWriterContext): ILogWriter {
    if (clientLogsFeatureConfig.isEnabled) {
      return this.createDynamoDbWriter(context);
    } else {
      return this.createNoopWriter();
    }
  }
}
