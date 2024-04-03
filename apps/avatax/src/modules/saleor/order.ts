import { z } from "zod";
import { TaxCalculationStrategy } from "../../../generated/graphql";
import { OrderCancelledPayload } from "../webhooks/payloads/order-cancelled-payload";

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
export class SaleorCancelledOrder {
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

  private data: z.infer<typeof SaleorCancelledOrder.schema>;

  constructor(data: Omit<OrderCancelledPayload, "__typename">) {
    this.data = data as z.infer<typeof SaleorCancelledOrder.schema>;
  }

  public get privateMetadata() {
    return this.data.recipient.privateMetadata;
  }

  public get channelSlug() {
    return this.data.order.channel.slug;
  }

  public get avataxId() {
    return this.data.order.avataxId;
  }

  public static parser(data: unknown) {
    return SaleorCancelledOrder.schema.parse(data);
  }
}
