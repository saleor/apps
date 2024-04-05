import { z } from "zod";
import { TaxCalculationStrategy } from "../../../generated/graphql";
import { OrderCancelledPayload as OrderCancelledPayloadFragment } from "../webhooks/payloads/order-cancelled-payload";
import { Result, err, ok } from "neverthrow";
import { OrderCancelNoAvataxIdError, OrderCancelPayloadOrderError } from "./order-cancel-error";
import { BaseError } from "../../error";

type SaleorOrderData = z.infer<typeof SaleorOrder.schema>;

export class SaleorOrder {
  public static schema = z.object({
    order: z.object({
      channel: z.object({
        taxConfiguration: z.object({
          pricesEnteredWithTax: z.boolean(),
          taxCalculationStrategy: z.nativeEnum(TaxCalculationStrategy),
        }),
        slug: z.string(),
      }),
      status: z.string(),
      id: z.string(),
    }),
  });

  private data: SaleorOrderData;

  constructor(data: SaleorOrderData) {
    this.data = data;
  }

  public get channelSlug() {
    return this.data.order.channel.slug;
  }

  public isFulfilled() {
    return this.data.order.status === "FULFILLED";
  }

  public isStrategyFlatRates() {
    return (
      this.data.order.channel.taxConfiguration.taxCalculationStrategy ===
      TaxCalculationStrategy.FlatRates
    );
  }

  public get id() {
    return this.data.order.id;
  }

  public get taxIncluded() {
    return this.data.order.channel.taxConfiguration.pricesEnteredWithTax;
  }
}

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
