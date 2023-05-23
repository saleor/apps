import { distributeDiscount } from "../../taxes/distribute-discount";
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
    const distributedDiscounts = distributeDiscount(discountSum, linePrices);

    return lines.map((line, index) => {
      const discountAmount = distributedDiscounts[index];

      return {
        id: line.sourceLine.id,
        // todo: replace
        chargeTaxes: true,
        // todo: get from tax code matcher
        taxCode: "",
        quantity: line.quantity,
        // todo: clarify if I need to include discount in total amount
        totalAmount: Number(line.totalPrice.amount),
        unitAmount: Number(line.unitPrice.amount),
        discount: discountAmount,
      };
    });
  }

  transform({ taxBase, channelConfig }: Payload): Target {
    const fromAddress = taxJarAddressFactory.fromChannelAddress(channelConfig.address);

    if (!taxBase.address) {
      throw new Error("Customer address is required to calculate taxes in TaxJar.");
    }

    const toAddress = taxJarAddressFactory.fromSaleorAddress(taxBase.address);

    const taxParams = {
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
