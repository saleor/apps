import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";
import { ILogWriter } from "@/modules/client-logs/log-writer";

/**
 * Just no-op. For testing or if feature is disabled
 */
export class NoopLogWriter implements ILogWriter {
  async writeLog(log: ClientLogStoreRequest): Promise<void> {
    return;
  }
}
