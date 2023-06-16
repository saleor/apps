import { TaxBaseFragment } from "../../../../generated/graphql";
import { taxJarAddressFactory } from "../address-factory";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarCalculateTaxesPayloadLinesTransformer } from "./taxjar-calculate-taxes-payload-lines-transformer";
import { TaxJarCalculateTaxesTarget } from "./taxjar-calculate-taxes-adapter";

export class TaxJarCalculateTaxesPayloadTransformer {
  constructor(private readonly config: TaxJarConfig) {}

  transform(taxBase: TaxBaseFragment, matches: TaxJarTaxCodeMatches): TaxJarCalculateTaxesTarget {
    const fromAddress = taxJarAddressFactory.fromChannelToTax(this.config.address);

    if (!taxBase.address) {
      throw new Error("Customer address is required to calculate taxes in TaxJar.");
    }

    const lineTransformer = new TaxJarCalculateTaxesPayloadLinesTransformer();
    const toAddress = taxJarAddressFactory.fromSaleorToTax(taxBase.address);

    const taxParams: TaxJarCalculateTaxesTarget = {
      params: {
        ...fromAddress,
        ...toAddress,
        shipping: taxBase.shippingPrice.amount,
        line_items: lineTransformer.transform(taxBase, matches),
      },
    };

    return taxParams;
  }
}
