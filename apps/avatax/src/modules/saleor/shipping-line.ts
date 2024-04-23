import { Result, err, ok } from "neverthrow";
import { z } from "zod";
import { BaseError } from "../../error";
import { SHIPPING_ITEM_CODE } from "../avatax/calculate-taxes/avatax-shipping-line";

export interface ISaleorOrderConfirmedShippingLine {
  getAmount(): number;
  getIsTaxIncluded(): boolean;
  getIsDiscounted(): boolean;
  getQuantity(): number;
  getItemCode(): string;
  getShippingTaxCode(): string | undefined;
}

export class SaleorOrderConfirmedShippingLine implements ISaleorOrderConfirmedShippingLine {
  public static schema = z.object({
    gross: z.object({
      amount: z.number(),
    }),
    net: z.object({
      amount: z.number(),
    }),
  });

  private constructor(
    private data: z.infer<typeof SaleorOrderConfirmedShippingLine.schema>,
    // order config
    private isTaxIncluded: boolean,
    private isDiscounted: boolean,
    // avatax config
    private shippingTaxCode: string | undefined,
  ) {}

  public static ParsingError = BaseError.subclass("SaleorOrderConfirmedShippingLineParsingError");

  public static create(
    payload: unknown,
    isTaxIncluded: boolean,
    isDiscounted: boolean,
    shippingTaxCode: string | undefined,
  ) {
    const parser = Result.fromThrowable(
      SaleorOrderConfirmedShippingLine.schema.parse,
      SaleorOrderConfirmedShippingLine.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(
      new SaleorOrderConfirmedShippingLine(
        parsedPayload.value,
        isTaxIncluded,
        isDiscounted,
        shippingTaxCode,
      ),
    );
  }

  getAmount(): number {
    return this.isTaxIncluded ? this.data.gross.amount : this.data.net.amount;
  }

  getIsTaxIncluded(): boolean {
    return this.isTaxIncluded;
  }

  getIsDiscounted(): boolean {
    return this.isDiscounted;
  }

  getQuantity(): number {
    return 1;
  }

  getItemCode(): string {
    return SHIPPING_ITEM_CODE;
  }

  getShippingTaxCode(): string | undefined {
    /**
     * * Different shipping methods can have different tax codes.
     * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/
     */
    return this.shippingTaxCode;
  }
}
