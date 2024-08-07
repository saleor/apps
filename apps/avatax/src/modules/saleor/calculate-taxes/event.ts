import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/error";
import { CalculateTaxesPayload } from "@/modules/webhooks/payloads/calculate-taxes-payload";

export class SaleorCalculateTaxesEvent {
  private static schema = z.object({
    taxBase: z.object({
      discounts: z
        .array(
          z.object({
            amount: z.object({
              amount: z.number(),
            }),
          }),
        )
        .max(1),
    }),
  });
  static ParsingError = BaseError.subclass("SaleorCalculateTaxesEventParsingError");

  private constructor(private data: z.infer<typeof SaleorCalculateTaxesEvent.schema>) {}

  static createFromGraphQL = (payload: CalculateTaxesPayload) => {
    const parser = Result.fromThrowable(
      SaleorCalculateTaxesEvent.schema.parse,
      SaleorCalculateTaxesEvent.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(new SaleorCalculateTaxesEvent(parsedPayload.value));
  };

  private getDiscountObject() {
    return this.data.taxBase.discounts[0];
  }

  getDiscountAmount() {
    const discountObject = this.getDiscountObject();

    if (discountObject) {
      return discountObject.amount.amount;
    }

    return 0;
  }

  getIsDiscounted() {
    return this.getDiscountObject() ? true : false;
  }
}
