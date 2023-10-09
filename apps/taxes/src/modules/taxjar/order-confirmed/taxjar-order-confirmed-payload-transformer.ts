import { LineItem } from "taxjar/dist/util/types";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { TaxBadPayloadError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarOrderConfirmedTarget } from "./taxjar-order-confirmed-adapter";
import { TaxJarOrderConfirmedPayloadLinesTransformer } from "./taxjar-order-confirmed-payload-lines-transformer";

// todo: refactor to a move descriptive class
export function sumPayloadLines(lines: LineItem[]): number {
  return numbers.roundFloatToTwoDecimals(
    lines.reduce(
      (prev, line) =>
        prev +
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          line.unit_price,
          new TaxBadPayloadError("Line unit_price is required to calculate order taxes"),
        ) *
          taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
            line.quantity,
            new TaxBadPayloadError("Line quantity is required to calculate order taxes"),
          ),
      0,
    ),
  );
}

export class TaxJarOrderConfirmedPayloadTransformer {
  transform(
    order: OrderConfirmedSubscriptionFragment,
    taxJarConfig: TaxJarConfig,
    matches: TaxJarTaxCodeMatches,
  ): TaxJarOrderConfirmedTarget {
    const linesTransformer = new TaxJarOrderConfirmedPayloadLinesTransformer();
    const lineItems = linesTransformer.transform(order.lines, matches);
    const lineSum = sumPayloadLines(lineItems);
    const shippingAmount = order.shippingPrice.gross.amount;
    /**
     * "The TaxJar API performs arbitrary-precision decimal arithmetic for accurately calculating sales tax."
     * but we want to round to 2 decimals for consistency
     */
    const orderAmount = numbers.roundFloatToTwoDecimals(shippingAmount + lineSum);

    return {
      params: {
        from_country: taxJarConfig.address.country,
        from_zip: taxJarConfig.address.zip,
        from_state: taxJarConfig.address.state,
        from_city: taxJarConfig.address.city,
        from_street: taxJarConfig.address.street,
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
