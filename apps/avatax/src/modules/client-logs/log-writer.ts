import { ClientLogStoreRequest } from "@/modules/client-logs/client-log";

export type LogWriterContext = { appId: string; saleorApiUrl: string };

export interface ILogWriter {
  writeLog(log: ClientLogStoreRequest): Promise<void>;
}
