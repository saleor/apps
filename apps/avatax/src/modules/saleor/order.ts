import { z } from "zod";

export class SaleorOrder {
  public static schema = z.object({
    order: z.object({
      channel: z.object({
        taxConfiguration: z.object({ pricesEnteredWithTax: z.boolean() }),
        slug: z.string(),
      }),
      status: z.string(),
      id: z.string(),
    }),
  });

  private data: z.infer<typeof SaleorOrder.schema>;

  constructor(data: z.infer<typeof SaleorOrder.schema>) {
    this.data = data;
  }

  public get channelSlug() {
    return this.data.order.channel.slug;
  }

  public isFulfilled() {
    return this.data.order.status === "FULFILLED";
  }

  public get id() {
    return this.data.order.id;
  }

  public get taxIncluded() {
    return this.data.order.channel.taxConfiguration.pricesEnteredWithTax;
  }
}
