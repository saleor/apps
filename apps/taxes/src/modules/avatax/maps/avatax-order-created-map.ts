import { DocumentType } from "avatax/lib/enums/DocumentType";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { avataxAddressFactory } from "./address-factory";

const mapLines = (order: OrderCreatedSubscriptionFragment): LineItemModel[] => {
  const productLines = order.lines.map((line) => ({
    amount: line.unitPrice.net.amount,
    quantity: line.quantity,
    // todo: get from tax code matcher
    taxCode: "",
  }));

  return productLines;
};

const mapPayload = (
  order: OrderCreatedSubscriptionFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): CreateTransactionArgs => {
  return {
    model: {
      type: DocumentType.SalesInvoice,
      customerCode: order.user?.id ?? "",
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
};
