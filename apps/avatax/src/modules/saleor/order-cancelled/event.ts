import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "../../../error";
import { OrderCancelledPayload as OrderCancelledPayloadFragment } from "../../webhooks/payloads/order-cancelled-payload";
import { OrderCancelNoAvataxIdError, OrderCancelPayloadOrderError } from "./errors";

interface ISaleorCancelledOrderEvent {
  getChannelSlug(): string;
  getAvataxId(): string;
  getPrivateMetadata(): Array<{ key: string; value: string }>;
}

export class SaleorCancelledOrderEvent implements ISaleorCancelledOrderEvent {
  private static schema = z.object({
    order: z.object({
      channel: z.object({
        id: z.string(),
        slug: z.string(),
      }),
      id: z.string(),
      avataxId: z.string(),
    }),
    recipient: z.object({
      privateMetadata: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
    }),
  });

  private constructor(private data: z.infer<typeof SaleorCancelledOrderEvent.schema>) {}

  getPrivateMetadata() {
    return this.data.recipient.privateMetadata;
  }

  getChannelSlug() {
    return this.data.order.channel.slug;
  }

  getAvataxId() {
    return this.data.order.avataxId;
  }

  public static ParsingError = BaseError.subclass("AvataxAppSaleorOrderCancelledParsingError");

  static create(payload: OrderCancelledPayloadFragment) {
    if (!payload.order) {
      return err(
        new OrderCancelPayloadOrderError("Insufficient order data", {
          cause: '"order" missing',
        }),
      );
    }

    if (!payload.order.avataxId) {
      return err(
        new OrderCancelNoAvataxIdError("No AvaTax id found in order", {
          cause: '"avataxId" missing in "order"',
        }),
      );
    }

    const parser = Result.fromThrowable(
      SaleorCancelledOrderEvent.schema.parse,
      SaleorCancelledOrderEvent.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(new SaleorCancelledOrderEvent(parsedPayload.value));
  }
}
