import { Result } from "neverthrow";
import { BaseError } from "../../error";
import { SaleorOrder } from "./order";

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
