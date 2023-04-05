import { DocumentType } from "avatax/lib/enums/DocumentType";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderFulfilledSubscriptionFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { AvataxConfig } from "./avatax-config";

const transformLines = (order: OrderFulfilledSubscriptionFragment): LineItemModel[] => {
  const productLines = order.lines.map((line) => ({
    amount: line.unitPrice.net.amount,
    quantity: line.quantity,
    itemCode: "Product",
  }));

  return productLines;
};

const transformPayload = (
  order: OrderFulfilledSubscriptionFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): CreateTransactionModel => {
  return {
    type: DocumentType.SalesInvoice,
    customerCode: "0", // todo: replace with customer code
    companyCode: config.companyName,
    commit: true, // * what about config.isAutocommit?
    addresses: {
      shipFrom: {
        line1: channel.address.street,
        city: channel.address.city,
        region: channel.address.state,
        postalCode: channel.address.zip,
        country: channel.address.country,
      },
      // billing or shipping address?
      shipTo: {
        line1: order.billingAddress?.streetAddress1,
        line2: order.billingAddress?.streetAddress2,
        city: order.billingAddress?.city,
        country: order.billingAddress?.country.code,
        postalCode: order.billingAddress?.postalCode,
        region: order.billingAddress?.countryArea,
      },
    },
    // todo: add currency code
    currencyCode: "",
    lines: transformLines(order),
    // todo: replace date with order/checkout date
    date: new Date(),
  };
};

export const avataxOrderFulfilled = {
  transformPayload,
};
