import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/error";

import { jsonSchema } from "./json-schema";

interface IClientLogVO<Value> {
  getValue(): Value;
}

const baseClientLogSchema = z.object({
  message: z.string(),
  level: z.union([
    z.literal("silly"),
    z.literal("trace"),
    z.literal("debug"),
    z.literal("info"),
    z.literal("warn"),
    z.literal("error"),
    z.literal("fatal"),
  ]),
  date: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  attributes: z.record(z.string(), jsonSchema).default({}),
  checkoutOrOrderId: z.string().optional(),
  checkoutOrOrder: z.enum(["checkout", "order"]),
  channelId: z.string().optional(),
});

export class ClientLog implements IClientLogVO<z.infer<typeof ClientLog.schema>> {
  private static schema = baseClientLogSchema.extend({
    id: z.string(),
  });

  private constructor(private log: z.infer<typeof ClientLog.schema>) {}

  getValue() {
    return this.log;
  }

  static ClientLogError = BaseError.subclass("ClientLogError");
  static InputParseError = BaseError.subclass("InputParseError");

  static create(
    logData: z.input<typeof this.schema>,
  ): Result<ClientLog, InstanceType<typeof this.InputParseError>> {
    const logParseResult = this.schema.safeParse(logData);

    if (!logParseResult.success) {
      return err(
        new this.InputParseError("Error parsing input for ClientLog", {
          cause: logParseResult.error,
        }),
      );
    }

    return ok(new ClientLog(logParseResult.data));
  }
}

export type ClientLogValue = z.infer<(typeof ClientLog)["schema"]>;

export class ClientLogStoreRequest {
  private static schema = baseClientLogSchema;

  private constructor(private log: z.infer<typeof ClientLogStoreRequest.schema>) {}

  getValue() {
    return this.log;
  }

  static ClientLogStoreRequestError = BaseError.subclass("ClientLogStoreRequestError");
  static InputParseError = BaseError.subclass("InputParseError");

  static create(
    logData: z.input<typeof this.schema>,
  ): Result<ClientLogStoreRequest, InstanceType<typeof this.InputParseError>> {
    const logParseResult = this.schema.safeParse(logData);

    if (!logParseResult.success) {
      return err(
        new this.InputParseError("Error parsing input for ClientLogStoreRequest", {
          cause: logParseResult.error,
        }),
      );
    }

    return ok(new ClientLogStoreRequest(logParseResult.data));
  }
}

export type ClientLogStoreRequestValue = z.infer<(typeof ClientLogStoreRequest)["schema"]>;
