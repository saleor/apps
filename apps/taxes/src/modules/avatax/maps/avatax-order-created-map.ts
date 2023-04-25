import { DocumentType } from "avatax/lib/enums/DocumentType";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { avataxAddressFactory } from "./address-factory";

/**
 * * Shipping is a regular line item in Avatax
 * https://developer.avalara.com/avatax/dev-guide/shipping-and-handling/taxability-of-shipping-charges/
 */
const SHIPPING_ITEM_CODE = "Shipping";

function mapLines(order: OrderCreatedSubscriptionFragment): LineItemModel[] {
  const productLines = order.lines.map((line) => ({
    amount: line.unitPrice.net.amount,
    // todo: get from tax code matcher
    taxCode: "",
    quantity: line.quantity,
    description: line.productName,
  }));

  if (order.shippingPrice.net.amount !== 0) {
    // * In Avatax, shipping is a regular line
    const shippingLine: LineItemModel = {
      amount: order.shippingPrice.net.amount,
      itemCode: SHIPPING_ITEM_CODE,
      /**
       * todo: add taxCode
       * * Different shipping methods can have different tax codes.
       * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/\
       */
      quantity: 1,
    };

    return [...productLines, shippingLine];
  }

  return productLines;
}

export type CreateTransactionMapPayloadArgs = {
  order: OrderCreatedSubscriptionFragment;
  channel: ChannelConfig;
  config: AvataxConfig;
};

const mapPayload = ({
  order,
  channel,
  config,
}: CreateTransactionMapPayloadArgs): CreateTransactionArgs => {
  return {
    model: {
      type: DocumentType.SalesInvoice,
      customerCode:
        order.user?.id ??
        "" /* In Saleor Avatax plugin, the customer code is 0. In Taxes App, we set it to the user id. */,
      companyCode: config.companyCode,
      // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
      commit: config.isAutocommit,
      addresses: {
        shipFrom: avataxAddressFactory.fromChannelAddress(channel.address),
        // billing or shipping address?
        shipTo: avataxAddressFactory.fromSaleorAddress(order.billingAddress!),
      },
      currencyCode: order.total.currency,
      email: order.user?.email ?? "",
      lines: mapLines(order),
      date: new Date(order.created),
    },
  };
};

const mapResponse = (response: TransactionModel): CreateOrderResponse => {
  return {
    id: response.code ?? "",
  };
};

export const avataxOrderCreatedMaps = {
  mapPayload,
  mapResponse,
  shippingItemCode: SHIPPING_ITEM_CODE,
};
