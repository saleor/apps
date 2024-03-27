import { z } from "zod";
import { TaxCalculationStrategy } from "../../../generated/graphql";

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
