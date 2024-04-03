import { Result } from "neverthrow";
import { BaseError } from "../../error";
import { SaleorCancelledOrder, SaleorOrder } from "./order";
import { verifyOrderCanceledPayload } from "../webhooks/validate-webhook-payload";

export class SaleorOrderParser {
  public static ParsingError = BaseError.subclass("AvataxAppSaleorOrderParsingError");

  public static parse(payload: unknown) {
    const safeParse = Result.fromThrowable(
      SaleorOrder.schema.parse,
      SaleorOrderParser.ParsingError.normalize,
    );

    return safeParse(payload);
  }
}

export class SaleorOrderCancelledParser {
  public static ParsingError = BaseError.subclass("AvataxAppSaleorOrderCancelledParsingError");

  public static parse(payload: unknown) {
    const verifiedPayload = verifyOrderCanceledPayload(payload);

    if (verifiedPayload.isErr()) {
      throw verifiedPayload.error;
    }

    const safeParse = Result.fromThrowable(
      SaleorCancelledOrder.parser,
      SaleorOrderCancelledParser.ParsingError.normalize,
    );

    const parsed = safeParse(verifiedPayload.value);

    if (parsed.isErr()) {
      throw parsed.error;
    }

    return new SaleorCancelledOrder(parsed.value);
  }
}
