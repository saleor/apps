import { LineItem } from "taxjar/dist/util/types";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { TaxJarConfig } from "../taxjar-config";
import {
  TaxJarOrderCreatedPayload,
  TaxJarOrderCreatedTarget,
} from "./taxjar-order-created-adapter";

export function sumPayloadLines(lines: LineItem[]): number {
  return numbers.roundFloatToTwoDecimals(
    lines.reduce(
      (prev, line) =>
        prev +
        taxProviderUtils.resolveOptionalOrThrow(
          line.unit_price,
          new Error("Line unit_price is required to calculate order taxes")
        ) *
          taxProviderUtils.resolveOptionalOrThrow(
            line.quantity,
            new Error("Line quantity is required to calculate order taxes")
          ),
      0
    )
  );
}

export class TaxJarOrderCreatedPayloadTransformer {
  constructor(private readonly config: TaxJarConfig) {}
  private mapLines(lines: OrderCreatedSubscriptionFragment["lines"]): LineItem[] {
    return lines.map((line) => ({
      quantity: line.quantity,
      unit_price: line.unitPrice.net.amount,
      product_identifier: line.productSku ?? "",
      // todo: add from tax code matcher
      product_tax_code: "",
      sales_tax: line.totalPrice.tax.amount,
      description: line.productName,
    }));
  }

  transform({ order }: TaxJarOrderCreatedPayload): TaxJarOrderCreatedTarget {
    const lineItems = this.mapLines(order.lines);
    const lineSum = sumPayloadLines(lineItems);
    const shippingAmount = order.shippingPrice.gross.amount;
    /**
     * "The TaxJar API performs arbitrary-precision decimal arithmetic for accurately calculating sales tax."
     * but we want to round to 2 decimals for consistency
     */
    const orderAmount = numbers.roundFloatToTwoDecimals(shippingAmount + lineSum);

    return {
      params: {
        from_country: this.config.address.country,
        from_zip: this.config.address.zip,
        from_state: this.config.address.state,
        from_city: this.config.address.city,
        from_street: this.config.address.street,
        to_country: order.shippingAddress!.country.code,
        to_zip: order.shippingAddress!.postalCode,
        to_state: order.shippingAddress!.countryArea,
        to_city: order.shippingAddress!.city,
        to_street: `${order.shippingAddress!.streetAddress1} ${
          order.shippingAddress!.streetAddress2
        }`,
        shipping: shippingAmount,
        line_items: lineItems,
        transaction_date: order.created,
        transaction_id: order.id,
        amount: orderAmount,

        // todo: add sales_tax
        sales_tax: 0,
      },
    };
  }
}
