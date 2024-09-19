import { type FormattedItem, type ParsedValue, Parser } from "dynamodb-toolbox";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/error";

import { ClientLog, type ClientLogStoreRequest, type ClientLogValue } from "./client-log";
import {
  ClientLogDynamoSchema,
  type LogByCheckoutOrOrderIdEntity,
  type LogByDateEntity,
  LogsTable,
} from "./dynamo-schema";
import { type Json } from "./json-schema";

export class LogsTransformer {
  constructor() {}

  private fromClientLogRequestToDynamoEntityValues({
    clientLogRequest,
    saleorApiUrl,
    appId,
  }: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }) {
    const log = clientLogRequest.getValue();
    const PK = LogsTable.getPrimaryKey({ saleorApiUrl, appId });

    return {
      PK,
      message: log.message,
      level: this.getDynamoLevelFromClientLogLevel(log.level),
      date: log.date,
      attributes: JSON.stringify(log.attributes),
      checkoutOrOrderId: log.checkoutOrOrderId,
      checkoutOrOrder: log.checkoutOrOrder,
      channelId: log.channelId,
    };
  }

  fromClientLogRequestToDynamoByDateEntityValue(inputData: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }): ParsedValue<typeof ClientLogDynamoSchema.logByDate> {
    const data = this.fromClientLogRequestToDynamoEntityValues(inputData);

    return ClientLogDynamoSchema.logByDate.build(Parser).parse(data);
  }

  fromClientLogRequestToDynamoByCheckoutOrOrderIdEntityValue(inputData: {
    clientLogRequest: ClientLogStoreRequest;
    saleorApiUrl: string;
    appId: string;
  }): ParsedValue<typeof ClientLogDynamoSchema.logByCheckoutOrOrderId> {
    const data = this.fromClientLogRequestToDynamoEntityValues(inputData);

    return ClientLogDynamoSchema.logByCheckoutOrOrderId.build(Parser).parse(data);
  }

  private getDynamoLevelFromClientLogLevel(level: ClientLogValue["level"]) {
    const mapping = {
      silly: 0,
      trace: 1,
      debug: 2,
      info: 3,
      warn: 4,
      error: 5,
      fatal: 6,
    };

    return mapping[level];
  }

  static LogsTransformerError = BaseError.subclass("LogsTransformerError");
  static DynamoDBParseError = this.LogsTransformerError.subclass("DynamoDBParseError");

  fromDynamoEntityToClientLog(
    entity: FormattedItem<LogByCheckoutOrOrderIdEntity> | FormattedItem<LogByDateEntity>,
  ): Result<ClientLog, InstanceType<typeof LogsTransformer.DynamoDBParseError>> {
    const parseResult = Result.fromThrowable(
      // This assertion is fine, ClientLog parses it's own schema
      () => JSON.parse(entity.attributes) as Record<string, Json>,
      (err) =>
        new LogsTransformer.DynamoDBParseError("Attributes cannot be parsed", { cause: err }),
    )();

    if (parseResult.isErr()) {
      return err(parseResult.error);
    }

    const createResult = ClientLog.create({
      level: this.getClientLogLevelFromDynamoLevel(entity.level),
      date: entity.date,
      message: entity.message,
      attributes: parseResult.value,
      channelId: entity.channelId,
      checkoutOrOrderId: entity.checkoutOrOrderId,
      id: entity.ulid,
      checkoutOrOrder: entity.checkoutOrOrder as "checkout" | "order",
    }).mapErr(
      (err) =>
        new LogsTransformer.DynamoDBParseError("Attributes cannot be parsed", { cause: err }),
    );

    if (createResult.isErr()) {
      return err(createResult.error);
    }

    return ok(createResult.value);
  }

  private getClientLogLevelFromDynamoLevel(level: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    const mapping = {
      0: "silly",
      1: "trace",
      2: "debug",
      3: "info",
      4: "warn",
      5: "error",
      6: "fatal",
    } as const;

    return mapping[level];
  }
}
