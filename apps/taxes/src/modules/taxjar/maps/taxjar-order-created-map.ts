import { LineItem } from "taxjar/dist/types/paramTypes";
import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { CreateOrderArgs } from "../taxjar-client";
import { numbers } from "../../taxes/numbers";

function mapLines(lines: OrderCreatedSubscriptionFragment["lines"]): LineItem[] {
  return lines.map((line) => ({
    quantity: line.quantity,
    unit_price: line.unitPrice.net.amount,
    product_identifier: line.productSku ?? "",
    // todo: add from tax code matcher
    product_tax_code: "",
    sales_tax: line.totalPrice.tax.amount,
  }));
}

function sumLines(lines: LineItem[]): number {
  return numbers.roundFloatToTwoDecimals(
    lines.reduce((prev, next) => prev + (next.unit_price ?? 0) * (next.quantity ?? 0), 0)
  );
}

export type TaxJarOrderCreatedMapPayloadArgs = {
  order: OrderCreatedSubscriptionFragment;
  channel: ChannelConfig;
};

const mapPayload = ({ order, channel }: TaxJarOrderCreatedMapPayloadArgs): CreateOrderArgs => {
  const lineItems = mapLines(order.lines);
  const lineSum = sumLines(lineItems);
  const shippingAmount = order.shippingPrice.net.amount;
  /**
   * "The TaxJar API performs arbitrary-precision decimal arithmetic for accurately calculating sales tax."
   * but we want to round to 2 decimals for consistency
   */
  const orderAmount = numbers.roundFloatToTwoDecimals(shippingAmount + lineSum);

  return {
    params: {
      from_country: channel.address.country,
      from_zip: channel.address.zip,
      from_state: channel.address.state,
      from_city: channel.address.city,
      from_street: channel.address.street,
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
      amount: orderAmount, // Total amount of the order with shipping, excluding sales tax in dollars.
      // todo: add sales_tax
      sales_tax: 0,
    },
  };
};

const mapResponse = (response: CreateOrderRes): CreateOrderResponse => {
  return {
    id: response.order.transaction_id,
  };
};

export const taxJarOrderCreatedMaps = {
  mapPayload,
  mapResponse,
  sumLines,
};
