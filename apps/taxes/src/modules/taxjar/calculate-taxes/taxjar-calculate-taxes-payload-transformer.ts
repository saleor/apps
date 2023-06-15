import { TaxBaseFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { taxJarAddressFactory } from "../address-factory";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarConfig } from "../taxjar-connection-schema";
import {
  TaxJarCalculateTaxesPayload,
  TaxJarCalculateTaxesTarget,
} from "./taxjar-calculate-taxes-adapter";
import { TaxJarTaxCodeMatcher } from "./taxjar-tax-code-matcher";

export class TaxJarCalculateTaxesPayloadTransformer {
  constructor(private readonly config: TaxJarConfig) {}

  private mapLines(
    taxBase: TaxJarCalculateTaxesPayload["taxBase"],
    matches: TaxJarTaxCodeMatches
  ): TaxJarCalculateTaxesTarget["params"]["line_items"] {
    const { lines, discounts } = taxBase;
    const discountSum = discounts?.reduce(
      (total, current) => total + Number(current.amount.amount),
      0
    );
    const linePrices = lines.map((line) => Number(line.totalPrice.amount));
    const distributedDiscounts = discountUtils.distributeDiscount(discountSum, linePrices);

    const mappedLines: TaxJarCalculateTaxesTarget["params"]["line_items"] = lines.map(
      (line, index) => {
        const matcher = new TaxJarTaxCodeMatcher();
        const discountAmount = distributedDiscounts[index];
        const taxCode = matcher.match(line, matches);

        return {
          id: line.sourceLine.id,
          product_tax_code: taxCode,
          quantity: line.quantity,
          unit_price: Number(line.unitPrice.amount),
          discount: discountAmount,
        };
      }
    );

    return mappedLines;
  }

  transform(taxBase: TaxBaseFragment, matches: TaxJarTaxCodeMatches): TaxJarCalculateTaxesTarget {
    const fromAddress = taxJarAddressFactory.fromChannelToTax(this.config.address);

    if (!taxBase.address) {
      throw new Error("Customer address is required to calculate taxes in TaxJar.");
    }

    const toAddress = taxJarAddressFactory.fromSaleorToTax(taxBase.address);

    const taxParams: TaxJarCalculateTaxesTarget = {
      params: {
        ...fromAddress,
        ...toAddress,
        shipping: taxBase.shippingPrice.amount,
        line_items: this.mapLines(taxBase, matches),
      },
    };

    return taxParams;
  }
}
