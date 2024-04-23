import { Result, err, ok } from "neverthrow";
import { z } from "zod";
import { BaseError } from "../../error";
import { AvataxOrderConfirmedTaxCodeMatcher } from "../avatax/order-confirmed/avatax-order-confirmed-tax-code-matcher";
import { AvataxTaxCodeMatches } from "../avatax/tax-code/avatax-tax-code-match-repository";

export interface ISaleorOrderConfrimedOrderLine {
  getAmount(): number;
  getTaxIncluded(): boolean;
  getTaxCode(matches: AvataxTaxCodeMatches): string;
  getQuantity(): number;
  getItemCode(): string;
  getDescription(): string;
  getIsDiscounted(): boolean;
}

export class SaleorOrderConfirmedLine implements ISaleorOrderConfrimedOrderLine {
  public static schema = z.object({
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
    taxClass: z.object({ id: z.string() }).optional(),
  });

  private constructor(
    private data: z.infer<typeof SaleorOrderConfirmedLine.schema>,
    private isTaxIncluded: boolean,
    private isDiscounted: boolean,
  ) {}

  public static ParsingError = BaseError.subclass("SaleorOrderConfirmedLineParsingError");

  public static create(payload: unknown, isTaxIncluded: boolean, isDiscounted: boolean) {
    const parser = Result.fromThrowable(
      SaleorOrderConfirmedLine.schema.parse,
      SaleorOrderConfirmedLine.ParsingError.normalize,
    );

    const parsedPayload = parser(payload);

    if (parsedPayload.isErr()) {
      return err(parsedPayload.error);
    }

    return ok(new SaleorOrderConfirmedLine(parsedPayload.value, isTaxIncluded, isDiscounted));
  }

  public getAmount() {
    return this.isTaxIncluded ? this.data.totalPrice.gross.amount : this.data.totalPrice.net.amount;
  }

  public getTaxIncluded() {
    return this.isTaxIncluded;
  }

  public getTaxCode(matches: AvataxTaxCodeMatches): string {
    const matcher = new AvataxOrderConfirmedTaxCodeMatcher();

    return matcher.match({
      taxClassId: this.data.taxClass?.id,
      matches,
    });
  }

  public getQuantity(): number {
    return this.data.quantity;
  }

  public getItemCode(): string {
    return this.data.productSku ?? this.data.productVariantId ?? "";
  }

  public getDescription(): string {
    return this.data.productName;
  }

  public getIsDiscounted(): boolean {
    return this.isDiscounted;
  }
}
