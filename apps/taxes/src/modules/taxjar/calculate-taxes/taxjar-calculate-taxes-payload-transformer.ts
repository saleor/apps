import { discountUtils } from "../../taxes/discount-utils";
import { taxJarAddressFactory } from "../address-factory";
import { Payload, Target } from "./taxjar-calculate-taxes-adapter";

export class TaxJarCalculateTaxesPayloadTransformer {
  private mapLines(taxBase: Payload["taxBase"]): Target["params"]["line_items"] {
    const { lines, discounts } = taxBase;
    const discountSum = discounts?.reduce(
      (total, current) => total + Number(current.amount.amount),
      0
    );
    const linePrices = lines.map((line) => Number(line.totalPrice.amount));
    const distributedDiscounts = discountUtils.distributeDiscount(discountSum, linePrices);

    const mappedLines: Target["params"]["line_items"] = lines.map((line, index) => {
      const discountAmount = distributedDiscounts[index];

      return {
        id: line.sourceLine.id,
        // todo: get from tax code matcher
        product_tax_code: "",
        quantity: line.quantity,
        unit_price: Number(line.unitPrice.amount),
        discount: discountAmount,
      };
    });

    return mappedLines;
  }

  transform({ taxBase, channelConfig }: Payload): Target {
    const fromAddress = taxJarAddressFactory.fromChannelAddress(channelConfig.address);

    if (!taxBase.address) {
      throw new Error("Customer address is required to calculate taxes in TaxJar.");
    }

    const toAddress = taxJarAddressFactory.fromSaleorAddress(taxBase.address);

    const taxParams: Target = {
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
