import { Result, err, ok } from "neverthrow";
import { z } from "zod";
import { BaseError } from "../../error";
import { AvataxConfig } from "../avatax/avatax-connection-schema";
import { OrderCancelledPayload as OrderCancelledPayloadFragment } from "../webhooks/payloads/order-cancelled-payload";
import { OrderCancelNoAvataxIdError, OrderCancelPayloadOrderError } from "./order-cancel-error";
import { ISaleorOrderConfrimedOrderLine, SaleorOrderConfirmedLine } from "./order-line";
import {
  ISaleorOrderConfirmedShippingLine,
  SaleorOrderConfirmedShippingLine,
} from "./shipping-line";

export interface ISaleorConfirmedOrderEvent {
  getChannelSlug(): string;
  getOrderId(): string;
  isFulfilled(): boolean;
  isStrategyFlatRates(): boolean;
  getIsTaxIncluded(): boolean;
  // getProductLines
  getLines(): ISaleorOrderConfrimedOrderLine[];
  getIsDiscounted(): boolean;
  hasShipping(): boolean;
  getShippingLine(config: AvataxConfig): ISaleorOrderConfirmedShippingLine;
}

export class SaleorOrderConfirmedEvent implements ISaleorConfirmedOrderEvent {
  private static schema = z.object({
    order: z.object({
      channel: z.object({
        taxConfiguration: z.object({
          pricesEnteredWithTax: z.boolean(),
          taxCalculationStrategy: z.union([z.literal("TAX_APP"), z.literal("FLAT_RATES")]),
        }),
        slug: z.string(),
      }),
      status: z.string(),
      id: z.string(),
      lines: z.array(SaleorOrderConfirmedLine.schema),
      discounts: z.array(z.object({})),
      shippingPrice: SaleorOrderConfirmedShippingLine.schema,
    }),
  });

  private constructor(private data: z.infer<typeof SaleorOrderConfirmedEvent.schema>) {}

  public static ParsingError = BaseError.subclass("SaleorOrderConfirmedEventParsingError");

  public static create(payload: unknown) {
    const parser = Result.fromThrowable(
      SaleorOrderConfirmedEvent.schema.parse,
      SaleorOrderConfirmedEvent.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(new SaleorOrderConfirmedEvent(parsedPayload.value));
  }

  getChannelSlug(): string {
    return this.data.order.channel.slug;
  }

  getOrderId(): string {
    return this.data.order.id;
  }

  isFulfilled(): boolean {
    return this.data.order.status === "FULFILLED";
  }

  isStrategyFlatRates(): boolean {
    return this.data.order.channel.taxConfiguration.taxCalculationStrategy === "FLAT_RATES";
  }

  getIsTaxIncluded(): boolean {
    return this.data.order.channel.taxConfiguration.pricesEnteredWithTax;
  }

  getIsDiscounted(): boolean {
    return this.data.order.discounts.length > 0;
  }

  getLines(): ISaleorOrderConfrimedOrderLine[] {
    return this.data.order.lines.map((line) => {
      const possibleLine = SaleorOrderConfirmedLine.create(
        line,
        this.getIsTaxIncluded(),
        this.getIsDiscounted(),
      );

      if (possibleLine.isErr()) {
        throw possibleLine.error;
      }

      return possibleLine.value;
    });
  }

  hasShipping(): boolean {
    return this.data.order.shippingPrice.net.amount !== 0;
  }

  getShippingLine(config: AvataxConfig): ISaleorOrderConfirmedShippingLine {
    const possibleShippingLine = SaleorOrderConfirmedShippingLine.create(
      this.data.order.shippingPrice,
      this.getIsTaxIncluded(),
      this.getIsDiscounted(),
      config.shippingTaxCode,
    );

    if (possibleShippingLine.isErr()) {
      throw possibleShippingLine.error;
    }

    return possibleShippingLine.value;
  }
}

interface ISaleorCancelledOrderEvent {
  getChannelSlug(): string;
  getAvataxId(): string;
  getPrivateMetadata(): Array<{ key: string; value: string }>;
}

// TODO: extract to its own file
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
