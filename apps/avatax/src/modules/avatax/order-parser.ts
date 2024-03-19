import { Result } from "neverthrow";
import { z } from "zod";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { BaseError } from "../../error";

/**
 * @deprecated use `AvataxAppOrder` instead
 */
export type DeprecatedOrderConfirmedSubscriptionFragment = OrderConfirmedSubscriptionFragment;

export type AvataxAppOrder = z.infer<typeof AvataxAppOrderParser.schema>;

export class AvataxAppOrderParser {
  public static schema = z
    .object({
      order: z.object({
        channel: z.object({
          taxConfiguration: z.object({ pricesEnteredWithTax: z.boolean() }),
          slug: z.string(),
        }),
        status: z.string(),
        id: z.string(),
      }),
    })
    .transform((payload) => ({
      taxIncluded: payload.order.channel.taxConfiguration.pricesEnteredWithTax,
      channelSlug: payload.order.channel.slug,
      isFulfilled: payload.order.status === "FULFILLED",
      id: payload.order.id,
    }));

  public static ParsingError = BaseError.subclass("AvataxAppOrderParsingError");

  public static parse(payload: unknown) {
    const safeParse = Result.fromThrowable(
      AvataxAppOrderParser.schema.parse,
      AvataxAppOrderParser.ParsingError.normalize,
    );

    return safeParse(payload);
  }
}
