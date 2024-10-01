import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "../../../error";
import { OrderConfirmedPayload } from "../../webhooks/payloads/order-confirmed-payload";
import { SaleorOrderLine } from "../order-line";

type EventWithOrder = Omit<OrderConfirmedPayload, "order"> & {
  order: NonNullable<OrderConfirmedPayload["order"]>;
};

export class SaleorOrderConfirmedEvent {
  /**
   * While GraphQL provides types contract, not everything can be consumed by the app.
   * For example App requires lines or shipping to calculate taxes.
   *
   * Schema here is additional validation - if these fields don't exist, app must handle gracefully lack of data in payload
   */
  private static requiredFieldsSchema = z.object({
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
    private rawPayload: EventWithOrder,
    private parsedLines: SaleorOrderLine[],
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
      SaleorOrderConfirmedEvent.requiredFieldsSchema.parse,
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

    return ok(new SaleorOrderConfirmedEvent(payload as EventWithOrder, parsedLinePayload.value));
  };

  getChannelSlug = () => this.rawPayload.order.channel.slug;

  getOrderId = () => this.rawPayload.order.id;

  isFulfilled = () => this.rawPayload.order.status === "FULFILLED";

  isStrategyFlatRates = () =>
    this.rawPayload.order.channel.taxConfiguration.taxCalculationStrategy === "FLAT_RATES";

  getIsTaxIncluded = () => this.rawPayload.order.channel.taxConfiguration.pricesEnteredWithTax;

  getLines = () => this.parsedLines;

  hasShipping = () => this.rawPayload.order.shippingPrice.net.amount !== 0;

  getShippingAmount = () =>
    this.getIsTaxIncluded()
      ? this.rawPayload.order.shippingPrice.gross.amount
      : this.rawPayload.order.shippingPrice.net.amount;

  resolveUserEmailOrEmpty = () =>
    this.rawPayload.order.user?.email ?? this.rawPayload.order?.userEmail ?? "";

  getOrderCurrency = () => this.rawPayload.order.total.currency;

  getUserId = () => this.rawPayload.order.user?.id;

  /**
   * @deprecated - We should use customer code from order
   */
  getLegacyAvaTaxCustomerCode = () => this.rawPayload.order.user?.avataxCustomerCode;

  getAvaTaxCustomerCode = () => this.rawPayload.order.avataxCustomerCode;

  getAvaTaxDocumentCode = () => this.rawPayload.order.avataxDocumentCode;

  getAvaTaxEntityCode = () => this.rawPayload.order.avataxEntityCode;

  getAvaTaxTaxCalculationDate = () => this.rawPayload.order.avataxTaxCalculationDate;

  getOrderCreationDate = () => this.rawPayload.order.created;

  getOrderShippingAddress = () => this.rawPayload.order.shippingAddress;

  getOrderBillingAddress = () => this.rawPayload.order.shippingAddress;
}
