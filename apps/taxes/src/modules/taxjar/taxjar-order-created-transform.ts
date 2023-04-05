import { CreateOrderParams, LineItem } from "taxjar/dist/types/paramTypes";
import { OrderSubscriptionFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";

const transformLines = (lines: OrderSubscriptionFragment["lines"]): LineItem[] => {
  return lines.map((line) => ({
    quantity: line.quantity,
    unit_price: line.unitPrice.net.amount,
    product_identifier: line.productSku ?? "",
    product_tax_code: "",
    sales_tax: line.totalPrice.tax.amount,
  }));
};

const transformPayload = (
  order: OrderSubscriptionFragment,
  channel: ChannelConfig
): CreateOrderParams => {
  const lineItems = transformLines(order.lines);
  const lineSum = lineItems.reduce(
    (prev, next) => prev + (next.unit_price ?? 0) * (next.quantity ?? 0),
    0
  );
  const shippingAmount = order.shippingPrice.net.amount;
  const orderAmount = shippingAmount + lineSum;

  return {
    from_country: channel.address.country,
    from_zip: channel.address.zip,
    from_state: channel.address.state,
    from_city: channel.address.city,
    from_street: channel.address.street,
    to_country: order.shippingAddress!.country.code,
    to_zip: order.shippingAddress!.postalCode,
    to_state: order.shippingAddress!.countryArea,
    to_city: order.shippingAddress!.city,
    to_street: `${order.shippingAddress!.streetAddress1} ${order.shippingAddress!.streetAddress2}`,
    shipping: shippingAmount,
    line_items: lineItems,
    transaction_date: order.created, // is this correct format?
    transaction_id: order.id,
    // todo: replace
    amount: orderAmount,
    sales_tax: 0,
  };
};

export const taxJarOrderCreated = {
  transformPayload,
};
