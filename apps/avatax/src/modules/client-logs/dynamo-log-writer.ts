import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { ILogWriter, LogWriterContext } from "@/modules/client-logs/log-writer";
import { ILogsRepository } from "@/modules/client-logs/logs-repository";

export class DynamoDbLogWriter implements ILogWriter {
  constructor(
    private repo: ILogsRepository,
    private context: LogWriterContext,
  ) {
    if (!repo) {
      throw new Error("Repository is nullish");
    }
  }

  writeLog = async (log: ClientLogStoreRequest): Promise<void> => {
    await this.repo.writeLog({
      appId: this.context.appId,
      saleorApiUrl: this.context.saleorApiUrl,
      clientLogRequest: log,
    });
  };
}
