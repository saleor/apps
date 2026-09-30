import { after } from "next/server";

import { type ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { type ILogsRepository } from "@/modules/client-logs/logs-repository";

export type LogWriterContext = { appId: string; saleorApiUrl: string };

export interface ILogWriter {
  writeLog(log: ClientLogStoreRequest): Promise<void>;
}

export class DynamoDbLogWriter implements ILogWriter {
  constructor(
    private repo: ILogsRepository,
    private context: LogWriterContext,
  ) {
    if (!repo) {
      throw new Error("Repository is nullish");
    }
  }

  /*
   * Callers don't await it, so the write is deferred with after() to run once the response is sent and
   * keep the function alive until it finishes. A write still pending when the request span ends has
   * its span force-ended by @vercel/otel and ended again by the AWS SDK instrumentation
   */
  writeLog = async (log: ClientLogStoreRequest): Promise<void> => {
    after(() =>
      this.repo.writeLog({
        appId: this.context.appId,
        saleorApiUrl: this.context.saleorApiUrl,
        clientLogRequest: log,
      }),
    );
  };
}

/**
 * Just no-op. For testing or if feature is disabled
 */
export class NoopLogWriter implements ILogWriter {
  async writeLog(log: ClientLogStoreRequest): Promise<void> {
    return;
  }
}
