import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { OrderLineFragment } from "../../../generated/graphql";
import { BaseError } from "../../error";
import { AvataxOrderConfirmedTaxCodeMatcher } from "../avatax/order-confirmed/avatax-order-confirmed-tax-code-matcher";
import { AvataxTaxCodeMatches } from "../avatax/tax-code/avatax-tax-code-match-repository";

export class SaleorOrderLine {
  private static schema = z.object({
    totalPrice: z.object({
      gross: z.object({
        amount: z.number(),
      }),
      net: z.object({
        amount: z.number(),
      }),
    }),
    quantity: z.number(),
    productSku: z.string().nullable(),
    productVariantId: z.string().nullable(),
    productName: z.string(),
    taxClass: z.object({ id: z.string() }).nullable().optional(),
  });

  private constructor(private data: z.infer<typeof SaleorOrderLine.schema>) {}

  static ParsingError = BaseError.subclass("SaleorOrderLineParsingError");

  static createFromGraphQL = (payload: OrderLineFragment) => {
    const parser = Result.fromThrowable(
      SaleorOrderLine.schema.parse,
      SaleorOrderLine.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(new SaleorOrderLine(parsedPayload.value));
  };

  getAmount = ({ isTaxIncluded }: { isTaxIncluded: boolean }) =>
    isTaxIncluded ? this.data.totalPrice.gross.amount : this.data.totalPrice.net.amount;

  getTaxCode = (matches: AvataxTaxCodeMatches) => {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    return matcher.match({
      taxClassId: this.data.taxClass?.id,
      matches,
    });
  };

  getQuantity = () => this.data.quantity;

  getItemCode = () => this.data.productSku ?? this.data.productVariantId ?? "";

  getDescription = () => this.data.productName;
}
