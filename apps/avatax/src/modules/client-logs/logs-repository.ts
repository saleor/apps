import { type BatchWriteCommandOutput } from "@aws-sdk/lib-dynamodb";
import {
  BatchDeleteRequest,
  BatchPutRequest,
  BatchWriteCommand,
  executeBatchWrite,
  QueryCommand,
  ScanCommand,
} from "dynamodb-toolbox";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { ulid } from "ulid";

import { BaseError } from "@/error";
import { createLogger } from "@/logger";
import { ClientLog, type ClientLogStoreRequest } from "@/modules/client-logs/client-log";

import {
  type LogByCheckoutOrOrderIdEntity,
  type LogByDateEntity,
  LogsTable,
} from "./dynamo-logs-table";
import { LogsTransformer } from "./log-transformer";

export type LastEvaluatedKey = Record<string, unknown> | undefined;

export interface ILogsRepository {
  getLogsByDate(args: {
    saleorApiUrl: string;
    startDate: Date;
    endDate: Date;
    appId: string;
  }): Promise<Result<{ clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey }, unknown>>;
  getLogsByCheckoutOrOrderId(args: {
    saleorApiUrl: string;
    appId: string;
    checkoutOrOrderId: string;
  }): Promise<Result<{ clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey }, unknown>>;
  writeLog(args: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<undefined, unknown>>;
  pruneAllLogs(args: { saleorApiUrl: string; appId: string }): Promise<Result<undefined, unknown>>;
}

/**
 * DynamoDB logs repository
 */
export class LogsRepositoryDynamodb implements ILogsRepository {
  private logsTable: LogsTable;
  private logsByCheckoutOrOrderId: LogByCheckoutOrOrderIdEntity;
  private logByDateEntity: LogByDateEntity;
  private logger: ReturnType<typeof createLogger>;

  constructor({
    logsTable,
    logByCheckoutOrOrderId,
    logByDateEntity,
  }: {
    logsTable: LogsTable;
    logByCheckoutOrOrderId: LogByCheckoutOrOrderIdEntity;
    logByDateEntity: LogByDateEntity;
  }) {
    this.logsTable = logsTable;

    this.logsByCheckoutOrOrderId = logByCheckoutOrOrderId;

    this.logByDateEntity = logByDateEntity;

    this.logger = createLogger("LogsRepositoryDynamodb");
  }

  static LogsRepositoryDynamicError = BaseError.subclass("LogsRepositoryDynamicError");
  static LogsFetchError = this.LogsRepositoryDynamicError.subclass("LogsFetchError");
  static DataMappingError = this.LogsRepositoryDynamicError.subclass("DataMappingError");

  async getLogsByDate({
    saleorApiUrl,
    startDate,
    endDate,
    appId,
    lastEvaluatedKey,
  }: {
    saleorApiUrl: string;
    startDate: Date;
    endDate: Date;
    appId: string;
    lastEvaluatedKey: LastEvaluatedKey;
  }): Promise<
    Result<
      { clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey },
      | InstanceType<typeof LogsRepositoryDynamodb.LogsFetchError>
      | InstanceType<typeof LogsRepositoryDynamodb.DataMappingError>
    >
  > {
    const transformer = new LogsTransformer();

    this.logger.debug("Starting fetching logs by date from DynamoDB", {
      saleorApiUrl,
      startDate,
      endDate,
      appId,
    });

    const fetchResult = await ResultAsync.fromPromise(
      this.logsTable
        .build(QueryCommand)
        .query({
          partition: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          range: {
            between: [startDate.toISOString(), endDate.toISOString()],
          },
        })
        .entities(this.logByDateEntity)
        .options({ limit: 100, capacity: "TOTAL", exclusiveStartKey: lastEvaluatedKey })
        .send(),
      (err) =>
        new LogsRepositoryDynamodb.LogsFetchError(
          "Error while fetching logs from DynamoDB by date",
          { cause: err },
        ),
    );

    if (fetchResult.isErr()) {
      this.logger.error("Error while fetching logs from DynamoDB by date", {
        error: fetchResult.error,
      });

      return err(fetchResult.error);
    }

    this.logger.debug("Fetched logs from DynamoDB by date", {
      Count: fetchResult.value.Count,
      ScannedCount: fetchResult.value.ScannedCount,
      ConsumedCapacity: fetchResult.value.ConsumedCapacity,
    });

    this.logger.debug("Details about fetched logs", { Items: fetchResult.value.Items });

    if (!fetchResult.value.Items) {
      this.logger.info("No logs found for specified dates", { startDate, endDate });

      return ok({ clientLogs: [], lastEvaluatedKey: undefined });
    }

    const clientLogs = Result.combine(
      fetchResult.value.Items.map((item) => transformer.fromDynamoEntityToClientLog(item)),
    ).mapErr((error) => {
      this.logger.error("Unexpected error while mapping DynamoDB response to ClientLog", { error });

      return new LogsRepositoryDynamodb.DataMappingError(
        "Error while mapping DynamoDB response to ClientLog",
        { cause: error },
      );
    });

    if (clientLogs.isErr()) {
      return err(clientLogs.error);
    }

    return ok({
      clientLogs: clientLogs.value,
      lastEvaluatedKey: fetchResult.value.LastEvaluatedKey,
    });
  }

  async getLogsByCheckoutOrOrderId({
    saleorApiUrl,
    appId,
    checkoutOrOrderId,
    lastEvaluatedKey,
  }: {
    saleorApiUrl: string;
    appId: string;
    checkoutOrOrderId: string;
    lastEvaluatedKey: LastEvaluatedKey;
  }): Promise<
    Result<
      { clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey },
      InstanceType<typeof LogsRepositoryDynamodb.DataMappingError>
    >
  > {
    const transformer = new LogsTransformer();

    this.logger.debug("Starting fetching logs by checkoutOrOrderId from DynamoDB", {
      saleorApiUrl,
      checkoutOrOrderId,
      appId,
    });

    const fetchResult = await ResultAsync.fromPromise(
      this.logsTable
        .build(QueryCommand)
        .query({
          partition: LogsTable.getPrimaryKey({ saleorApiUrl, appId }),
          range: {
            beginsWith: checkoutOrOrderId,
          },
        })
        .entities(this.logsByCheckoutOrOrderId)
        .options({ limit: 100, capacity: "TOTAL", exclusiveStartKey: lastEvaluatedKey })
        .send(),
      (err) =>
        new LogsRepositoryDynamodb.LogsFetchError(
          "Error while fetching logs from DynamoDB by checkoutOrOrderId",
          { cause: err },
        ),
    );

    if (fetchResult.isErr()) {
      this.logger.error("Error while fetching logs from DynamoDB by checkoutOrOrderId", {
        error: fetchResult.error,
      });

      return err(fetchResult.error);
    }

    this.logger.debug("Fetched logs from DynamoDB by checkoutOrOrderId", {
      Count: fetchResult.value.Count,
      ScannedCount: fetchResult.value.ScannedCount,
      ConsumedCapacity: fetchResult.value.ConsumedCapacity,
    });

    this.logger.debug("Details about fetched logs", { Items: fetchResult.value.Items });

    if (!fetchResult.value.Items) {
      this.logger.info("No logs found for checkoutOrOrderId", { checkoutOrOrderId });

      return ok({ clientLogs: [], lastEvaluatedKey: undefined });
    }

    const clientLogs = Result.combine(
      fetchResult.value.Items.map((item) => transformer.fromDynamoEntityToClientLog(item)),
    ).mapErr((error) => {
      this.logger.error("Unexpected error while mapping DynamoDB response to ClientLog", { error });

      return new LogsRepositoryDynamodb.DataMappingError(
        "Error while mapping DynamoDB response to ClientLog",
        { cause: error },
      );
    });

    if (clientLogs.isErr()) {
      return err(clientLogs.error);
    }

    return ok({
      clientLogs: clientLogs.value,
      lastEvaluatedKey: fetchResult.value.LastEvaluatedKey,
    });
  }

  private prepareBatchWriteFromClientLog(args: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }) {
    const transformer = new LogsTransformer();
    const logByCheckoutOrOrderId = args.clientLogRequest.getValue().checkoutOrOrderId
      ? transformer.fromClientLogRequestToDynamoByCheckoutOrOrderIdEntityValue(args)
      : null;
    const logByDateValues = transformer.fromClientLogRequestToDynamoByDateEntityValue(args);

    const requests = [
      logByCheckoutOrOrderId
        ? this.logsByCheckoutOrOrderId.build(BatchPutRequest).item(logByCheckoutOrOrderId)
        : undefined,
      this.logByDateEntity.build(BatchPutRequest).item(logByDateValues),
    ].filter((v) => !!v);

    return this.logsTable.build(BatchWriteCommand).requests(...requests);
  }

  private hasUnprocessedItems(unprocessedItems: BatchWriteCommandOutput["UnprocessedItems"]) {
    if (unprocessedItems) {
      const tableNames = Object.keys(unprocessedItems);

      return tableNames.length > 0;
    }

    return false;
  }

  static WriteLogError = this.LogsRepositoryDynamicError.subclass("WriteLogError");
  static UnprocessedItemsError = this.LogsRepositoryDynamicError.subclass("UnprocessedItemsError");

  async writeLog(args: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }): Promise<
    Result<
      undefined,
      | InstanceType<typeof LogsRepositoryDynamodb.UnprocessedItemsError>
      | InstanceType<typeof LogsRepositoryDynamodb.WriteLogError>
    >
  > {
    const cmd = this.prepareBatchWriteFromClientLog(args);

    const result = await ResultAsync.fromPromise(
      executeBatchWrite({ capacity: "TOTAL", metrics: "SIZE" }, cmd),
      (err) =>
        new LogsRepositoryDynamodb.WriteLogError("Error while writing logs to DynamoDB", {
          cause: err,
        }),
    );

    if (result.isErr()) {
      this.logger.warn("Error while writing logs to DynamoDB", { error: result.error });

      return err(result.error);
    }

    if (this.hasUnprocessedItems(result.value.UnprocessedItems)) {
      this.logger.warn("Some logs were not written to DynamoDB", {
        unprocessedItems: result.value.UnprocessedItems,
      });

      return err(new LogsRepositoryDynamodb.UnprocessedItemsError("Some logs were not written"));
    }

    this.logger.debug("Logs written to DynamoDB", {
      ConsumedCapacity: result.value.ConsumedCapacity,
      ItemCollectionMetrics: result.value.ItemCollectionMetrics,
    });

    return ok(undefined);
  }

  async pruneAllLogs({
    saleorApiUrl,
  }: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<
    Result<
      undefined,
      | InstanceType<typeof LogsRepositoryDynamodb.LogsFetchError>
      | InstanceType<typeof LogsRepositoryDynamodb.WriteLogError>
      | InstanceType<typeof LogsRepositoryDynamodb.UnprocessedItemsError>
    >
  > {
    this.logger.debug("Starting pruning logs for saleorApiUrl", { saleorApiUrl });

    const pkPrefix = `${saleorApiUrl}#`;

    let lastEvaluatedKey: LastEvaluatedKey;
    let deletedCount = 0;

    do {
      const scanResult = await ResultAsync.fromPromise(
        this.logsTable
          .build(ScanCommand)
          .entities(this.logByDateEntity, this.logsByCheckoutOrOrderId)
          .options({
            exclusiveStartKey: lastEvaluatedKey,
            showEntityAttr: true,
            filters: {
              LOG_BY_DATE: { attr: "PK", beginsWith: pkPrefix },
              LOG_BY_CHECKOUT_OR_ORDER_ID: { attr: "PK", beginsWith: pkPrefix },
            },
          })
          .send(),
        (error) =>
          new LogsRepositoryDynamodb.LogsFetchError("Error while scanning logs for pruning", {
            cause: error,
          }),
      );

      if (scanResult.isErr()) {
        this.logger.error("Error while scanning logs for pruning", { error: scanResult.error });

        return err(scanResult.error);
      }

      lastEvaluatedKey = scanResult.value.LastEvaluatedKey;

      const items = scanResult.value.Items ?? [];

      for (let i = 0; i < items.length; i += 25) {
        const chunk = items.slice(i, i + 25);

        const requests = chunk.map((item) =>
          item.entity === "LOG_BY_DATE"
            ? this.logByDateEntity
                .build(BatchDeleteRequest)
                .key({ PK: item.PK, ulid: item.ulid, date: item.date })
            : this.logsByCheckoutOrOrderId.build(BatchDeleteRequest).key({
                PK: item.PK,
                ulid: item.ulid,
                date: item.date,
                checkoutOrOrderId: item.checkoutOrOrderId,
              }),
        );

        const cmd = this.logsTable.build(BatchWriteCommand).requests(...requests);

        const deleteResult = await ResultAsync.fromPromise(
          executeBatchWrite({ capacity: "TOTAL", maxAttempts: 3 }, cmd),
          (error) =>
            new LogsRepositoryDynamodb.WriteLogError("Error while deleting logs from DynamoDB", {
              cause: error,
            }),
        );

        if (deleteResult.isErr()) {
          this.logger.error("Error while batch-deleting logs from DynamoDB", {
            error: deleteResult.error,
          });

          return err(deleteResult.error);
        }

        if (this.hasUnprocessedItems(deleteResult.value.UnprocessedItems)) {
          this.logger.warn("Some logs were not deleted from DynamoDB", {
            unprocessedItems: deleteResult.value.UnprocessedItems,
          });

          return err(
            new LogsRepositoryDynamodb.UnprocessedItemsError("Some logs were not deleted"),
          );
        }

        deletedCount += chunk.length;
      }
    } while (lastEvaluatedKey);

    this.logger.info("Pruned all logs for saleorApiUrl", { saleorApiUrl, deletedCount });

    return ok(undefined);
  }
}

/**
 * In-memory repository to be used for testing
 */
export class LogsRepositoryMemory implements ILogsRepository {
  public logs: ClientLog[] = [];

  async getLogsByDate(_args: {
    saleorApiUrl: string;
    startDate: Date;
    endDate: Date;
    appId: string;
    lastEvaluatedKey: LastEvaluatedKey;
  }): Promise<Result<{ clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey }, never>> {
    return ok({ clientLogs: this.logs, lastEvaluatedKey: undefined });
  }

  static UnexpectedWriteLogError = BaseError.subclass("UnexpectedWriteLogError");

  async writeLog({
    clientLogRequest,
  }: {
    clientLogRequest: ClientLogStoreRequest;
  }): Promise<
    Result<undefined, InstanceType<typeof LogsRepositoryMemory.UnexpectedWriteLogError>>
  > {
    const result = ClientLog.create({
      ...clientLogRequest.getValue(),
      id: ulid(),
    });

    if (result.isErr()) {
      return err(
        new LogsRepositoryMemory.UnexpectedWriteLogError("Error while writing log to memory", {
          cause: result.error,
        }),
      );
    }

    this.logs.push(result.value);

    return ok(undefined);
  }

  async getLogsByCheckoutOrOrderId(_args: {
    saleorApiUrl: string;
    appId: string;
    checkoutOrOrderId: string;
    lastEvaluatedKey: LastEvaluatedKey;
  }): Promise<Result<{ clientLogs: ClientLog[]; lastEvaluatedKey: LastEvaluatedKey }, never>> {
    return ok({ clientLogs: this.logs, lastEvaluatedKey: undefined });
  }

  async pruneAllLogs(args: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<undefined, unknown>> {
    this.logs = this.logs.filter((l) => {
      const log = l.getValue();
      const [saleorApiUrl] = LogsTable.decomposePrimaryKey(log.id);

      return args.saleorApiUrl !== saleorApiUrl;
    });

    return ok(undefined);
  }
}
