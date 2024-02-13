import { EncryptedMetadataManager, SettingsManager } from "@saleor/app-sdk/settings-manager";
import { ZodSchema, z } from "zod";
import { logUtils } from "./log-utils";
import { createLogger } from "../../logger";

export interface MetadataLogs<TLog extends unknown> {
  getAll(): Promise<TLog[]>;
  push(payload: unknown): Promise<void>;
}

type ClientLogsMetadataRepositoryOptions = {
  limit: number;
};

export type ClientLogsMetadataRepositoryParams<TLog extends unknown> = {
  settingsManager: EncryptedMetadataManager;
  schema: ZodSchema<TLog>;
  metadataKey: string;
  options: ClientLogsMetadataRepositoryOptions;
};

/**
 * ClientLogsMetadataRepository is a generic class that can be used to store logs in the app metadata.
 * The name "clientLogs" is used to distinguish it from the server logs. Client logs can appear in the app UI.
 */
export class ClientLogsMetadataRepository<TLog extends unknown> implements MetadataLogs<TLog> {
  private readonly settingsManager: EncryptedMetadataManager;
  private readonly schema: ZodSchema<TLog>;
  private readonly metadataKey: string;
  private readonly options: ClientLogsMetadataRepositoryOptions;
  private readonly logger = createLogger("ClientLogsMetadataRepository");
  private logs: TLog[] = [];

  constructor({
    settingsManager,
    schema,
    metadataKey,
    options,
  }: ClientLogsMetadataRepositoryParams<TLog>) {
    this.settingsManager = settingsManager;
    this.schema = schema;
    this.metadataKey = metadataKey;
    this.options = options;
  }

  async getAll() {
    if (this.logs.length) {
      this.logger.debug(`Returning cached logs for key ${this.metadataKey}`);
      return this.logs;
    }

    const metadata = await this.settingsManager.get(this.metadataKey);

    if (!metadata) {
      this.logger.debug(`No metadata found for key ${this.metadataKey}`);
      return [];
    }

    const parsedMetadata = JSON.parse(metadata);
    const validation = z.array(this.schema).safeParse(parsedMetadata);

    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    const logs = validation.data;

    this.logs = logs;

    this.logger.debug(`Returning logs for key ${this.metadataKey}`);

    return logs;
  }

  async push(payload: unknown) {
    const validation = this.schema.safeParse(payload);

    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    const log = validation.data;
    const logs = await this.getAll();
    const nextLogs = logUtils.unshiftItemToLimitedArray(logs, log, this.options.limit);

    this.logs = nextLogs;

    this.logger.debug(`Pushing log to metadata for key ${this.metadataKey}`);

    await this.settingsManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextLogs),
    });
  }
}
