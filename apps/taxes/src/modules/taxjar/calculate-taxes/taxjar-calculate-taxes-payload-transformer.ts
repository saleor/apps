import { discountUtils } from "../../taxes/discount-utils";
import { taxJarAddressFactory } from "../address-factory";
import { TaxJarConfig } from "../taxjar-config";
import {
  TaxJarCalculateTaxesPayload,
  TaxJarCalculateTaxesTarget,
} from "./taxjar-calculate-taxes-adapter";

export class TaxJarCalculateTaxesPayloadTransformer {
  constructor(private readonly config: TaxJarConfig) {}
  private mapLines(
    taxBase: TaxJarCalculateTaxesPayload["taxBase"]
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
        const discountAmount = distributedDiscounts[index];

        return {
          id: line.sourceLine.id,
          // todo: get from tax code matcher
          product_tax_code: "",
          quantity: line.quantity,
          unit_price: Number(line.unitPrice.amount),
          discount: discountAmount,
        };
      }
    );

    return mappedLines;
  }

  transform({ taxBase }: TaxJarCalculateTaxesPayload): TaxJarCalculateTaxesTarget {
    const fromAddress = taxJarAddressFactory.fromChannelAddress(this.config.address);

    if (!taxBase.address) {
      throw new Error("Customer address is required to calculate taxes in TaxJar.");
    }

    const toAddress = taxJarAddressFactory.fromSaleorAddress(taxBase.address);

    const taxParams: TaxJarCalculateTaxesTarget = {
      params: {
        ...fromAddress,
        ...toAddress,
        shipping: taxBase.shippingPrice.amount,
        line_items: this.mapLines(taxBase),
      },
    };

    return taxParams;
  }
}
