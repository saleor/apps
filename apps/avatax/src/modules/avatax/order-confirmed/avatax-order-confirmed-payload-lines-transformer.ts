import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { ISaleorOrderConfrimedOrderLine } from "../../saleor";
import { ISaleorOrderConfirmedShippingLine } from "../../saleor/shipping-line";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";

export class AvataxOrderConfirmedPayloadLinesTransformer {
  constructor(
    private args: {
      productLines: ISaleorOrderConfrimedOrderLine[];
      shippingLine: ISaleorOrderConfirmedShippingLine;
      hasShipping: boolean;
      matches: AvataxTaxCodeMatches;
    },
  ) {}

  transform(): LineItemModel[] {
    const productLines: LineItemModel[] = this.args.productLines.map((line) => ({
      amount: line.getAmount(),
      taxIncluded: line.getTaxIncluded(),
      taxCode: line.getTaxCode(this.args.matches),
      quantity: line.getQuantity(),
      discounted: line.getIsDiscounted(),
      itemCode: line.getItemCode(),
      description: line.getDescription(),
    }));

    if (this.args.hasShipping) {
      const line = this.args.shippingLine;

      const shippingLine: LineItemModel = {
        amount: line.getAmount(),
        taxIncluded: line.getIsTaxIncluded(),
        taxCode: line.getShippingTaxCode(),
        quantity: line.getQuantity(),
        discounted: line.getIsDiscounted(),
        itemCode: line.getItemCode(),
      };

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
