import { type BatchWriteCommandOutput } from "@aws-sdk/lib-dynamodb";
import {
  BatchPutRequest,
  BatchWriteCommand,
  executeBatchWrite,
  QueryCommand,
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
} from "./dynamo-schema";
import { LogsTransformer } from "./log-transformer";

export interface ILogsRepository {
  getLogsByDate(args: {
    saleorApiUrl: string;
    startDate: Date;
    endDate: Date;
    appId: string;
  }): Promise<Result<ClientLog[], unknown>>;
  getLogsByCheckoutOrOrderId(args: {
    saleorApiUrl: string;
    appId: string;
    checkoutOrOrderId: string;
  }): Promise<Result<ClientLog[], unknown>>;
  writeLog(args: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<undefined, unknown>>;
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
  }: {
    saleorApiUrl: string;
    startDate: Date;
    endDate: Date;
    appId: string;
  }): Promise<
    Result<
      ClientLog[],
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
        .options({ limit: 100, capacity: "TOTAL" })
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

      return ok([]);
    }

    return Result.combine(
      fetchResult.value.Items.map((item) => transformer.fromDynamoEntityToClientLog(item)),
    ).mapErr((error) => {
      this.logger.error("Unexpected error while mapping DynamoDB response to ClientLog", { error });

      return new LogsRepositoryDynamodb.DataMappingError(
        "Error while mapping DynamoDB response to ClientLog",
        { cause: error },
      );
    });
  }

  async getLogsByCheckoutOrOrderId({
    saleorApiUrl,
    appId,
    checkoutOrOrderId,
  }: {
    saleorApiUrl: string;
    appId: string;
    checkoutOrOrderId: string;
  }): Promise<Result<ClientLog[], InstanceType<typeof LogsRepositoryDynamodb.DataMappingError>>> {
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
        .options({ limit: 100, capacity: "TOTAL" })
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

      return ok([]);
    }

    return Result.combine(
      fetchResult.value.Items.map((item) => transformer.fromDynamoEntityToClientLog(item)),
    ).mapErr((error) => {
      this.logger.error("Unexpected error while mapping DynamoDB response to ClientLog", { error });

      return new LogsRepositoryDynamodb.DataMappingError(
        "Error while mapping DynamoDB response to ClientLog",
        { cause: error },
      );
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
  }): Promise<Result<ClientLog[], never>> {
    return ok(this.logs);
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
  }): Promise<Result<ClientLog[], never>> {
    return ok(this.logs);
  }
}
