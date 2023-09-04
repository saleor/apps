import { EncryptedMetadataManager, SettingsManager } from "@saleor/app-sdk/settings-manager";
import { ZodSchema, z } from "zod";
import { Logger, createLogger } from "../../lib/logger";

/**
 * Pushes item to first place in the array and limits array length to limit.
 * When array length is equal to limit, last item is removed.
 * @param array Array to push item to.
 * @param item Item to push to array.
 * @param limit Maximum length of array.
 */
function unshiftItemToLimitedArray<T>(array: T[], item: T, limit: number) {
  const newArray = [item, ...array];

  if (newArray.length > limit) {
    newArray.pop();
  }

  return newArray;
}

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
 */
export class ClientLogsMetadataRepository<TLog extends unknown> implements MetadataLogs<TLog> {
  private readonly settingsManager: EncryptedMetadataManager;
  private readonly schema: ZodSchema<TLog>;
  private readonly metadataKey: string;
  private readonly options: ClientLogsMetadataRepositoryOptions;
  private readonly logger: Logger;
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
    this.logger = createLogger({
      name: "ClientLogsMetadataRepository",
    });
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
    const nextLogs = unshiftItemToLimitedArray(logs, log, this.options.limit);

    this.logs = nextLogs;

    this.logger.debug(`Pushing log to metadata for key ${this.metadataKey}`);

    await this.settingsManager.set({
      key: this.metadataKey,
      value: JSON.stringify(nextLogs),
    });
  }
}
