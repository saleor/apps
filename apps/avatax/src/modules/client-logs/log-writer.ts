import { ClientLog, ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { ILogsRepository } from "@/modules/client-logs/logs-repository";

type Context = { appId: string; saleorApiUrl: string };

export interface ILogWriter {
  writeLog(log: ClientLogStoreRequest): Promise<void>;
}

export interface ILogWriterFactory {
  createWriter(context: Context): ILogWriter;
}

export class DynamoDbLogWriter implements ILogWriter {
  constructor(
    private repo: ILogsRepository,
    private context: Context,
  ) {}

  async writeLog(log: ClientLogStoreRequest): Promise<void> {
    await this.repo.writeLog({
      appId: this.context.appId,
      saleorApiUrl: this.context.saleorApiUrl,
      clientLogRequest: log,
    });
  }
}

/**
 * Just no-op. For testing or if feature is disabled
 */
export class NoopLogWriter implements ILogWriter {
  async writeLog(log: ClientLogStoreRequest): Promise<void> {
    return;
  }
}
