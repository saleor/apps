import { z } from "zod";
import { AvataxAppOrder, AvataxAppOrderParser } from "./order-parser";

export class AvataxAppOrderFactory {
  public static payload: z.input<typeof AvataxAppOrderParser.schema> = {
    order: {
      channel: {
        taxConfiguration: {
          pricesEnteredWithTax: true,
        },
        slug: "test",
      },
      status: "UNCONFIRMED",
      id: "test",
    },
  };

  public static create(): AvataxAppOrder {
    return {
      taxIncluded: true,
      channelSlug: "test",
      isFulfilled: false,
      id: "test",
    };
  }
}
