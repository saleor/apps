import { DocumentType } from "avatax/lib/enums/DocumentType";
import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderCreatedSubscriptionFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { AvataxConfig } from "./avatax-config";
import { CreateTransactionArgs } from "./avatax-client";
import { CreateOrderResponse } from "../taxes/tax-provider-webhook";
import { TransactionModel } from "avatax/lib/models/TransactionModel";

const transformLines = (order: OrderCreatedSubscriptionFragment): LineItemModel[] => {
  const productLines = order.lines.map((line) => ({
    amount: line.unitPrice.net.amount,
    quantity: line.quantity,
    itemCode: "Product",
  }));

  return productLines;
};

const transformPayload = (
  order: OrderCreatedSubscriptionFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): CreateTransactionArgs => {
  return {
    model: {
      type: DocumentType.SalesInvoice,
      customerCode: "0", // todo: replace with customer code
      companyCode: config.companyCode,
      // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
      commit: config.isAutocommit,
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
    },
  };
};

const transformResponse = (response: TransactionModel): CreateOrderResponse => {
  return {
    id: response.code ?? "",
  };
};

export const avataxOrderCreated = {
  transformPayload,
  transformResponse,
};
