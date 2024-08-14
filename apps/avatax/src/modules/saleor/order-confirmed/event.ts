import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "../../../error";
import { OrderConfirmedPayload } from "../../webhooks/payloads/order-confirmed-payload";
import { SaleorOrderLine } from "../order-line";

export class SaleorOrderConfirmedEvent {
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
      shippingPrice: z.object({
        gross: z.object({
          amount: z.number(),
        }),
        net: z.object({
          amount: z.number(),
        }),
      }),
    }),
  });

  private constructor(
    private data: z.infer<typeof SaleorOrderConfirmedEvent.schema>,
    private lines: SaleorOrderLine[],
  ) {}

  static ParsingError = BaseError.subclass("SaleorOrderConfirmedEventParsingError");

  static createFromGraphQL = (payload: OrderConfirmedPayload) => {
    if (!payload.order) {
      return err(
        new SaleorOrderConfirmedEvent.ParsingError("Insufficient order data", {
          cause: '"order" missing',
        }),
      );
    }

    const parser = Result.fromThrowable(
      SaleorOrderConfirmedEvent.schema.parse,
      SaleorOrderConfirmedEvent.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    const parsedLinePayload = Result.combine(
      payload.order.lines.map((line) => SaleorOrderLine.createFromGraphQL(line)),
    ).map((lines) => lines);

    if (parsedLinePayload.isErr()) {
      return err(parsedLinePayload.error);
    }

    return ok(new SaleorOrderConfirmedEvent(parsedPayload.value, parsedLinePayload.value));
  };

  getChannelSlug = () => this.data.order.channel.slug;

  getOrderId = () => this.data.order.id;

  isFulfilled = () => this.data.order.status === "FULFILLED";

  isStrategyFlatRates = () =>
    this.data.order.channel.taxConfiguration.taxCalculationStrategy === "FLAT_RATES";

  getIsTaxIncluded = () => this.data.order.channel.taxConfiguration.pricesEnteredWithTax;

  getLines = () => this.lines;

  hasShipping = () => this.data.order.shippingPrice.net.amount !== 0;

  getShippingAmount = () =>
    this.getIsTaxIncluded()
      ? this.data.order.shippingPrice.gross.amount
      : this.data.order.shippingPrice.net.amount;
}
