import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { numbers } from "../../taxes/numbers";
import { AvataxConfig } from "../avatax-config";
import { avataxAddressFactory } from "../address-factory";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { discountUtils } from "../../taxes/discount-utils";
import { CreateTransactionArgs } from "../avatax-client";

const SHIPPING_ITEM_CODE = "Shipping";

// ? separate class?
export function mapLines(
  order: OrderCreatedSubscriptionFragment,
  config: AvataxConfig
): LineItemModel[] {
  const productLines: LineItemModel[] = order.lines.map((line) => ({
    // taxes are included because we treat what is passed in payload as the source of truth
    taxIncluded: true,
    amount: numbers.roundFloatToTwoDecimals(
      line.totalPrice.net.amount + line.totalPrice.tax.amount
    ),
    // todo: get from tax code matcher
    taxCode: "",
    quantity: line.quantity,
    description: line.productName,
    itemCode: line.productSku ?? "",
    discounted: order.discounts.length > 0,
  }));

  if (order.shippingPrice.net.amount !== 0) {
    // * In Avatax, shipping is a regular line
    const shippingLine: LineItemModel = {
      amount: order.shippingPrice.gross.amount,
      taxIncluded: true,
      itemCode: SHIPPING_ITEM_CODE,
      /**
       * * Different shipping methods can have different tax codes.
       * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/non-standard-items/\
       */
      taxCode: config.shippingTaxCode,
      quantity: 1,
    };

    return [...productLines, shippingLine];
  }

  return productLines;
}

export class AvataxOrderCreatedPayloadTransformer {
  constructor(private readonly providerConfig: AvataxConfig) {}
  transform = ({ order }: { order: OrderCreatedSubscriptionFragment }): CreateTransactionArgs => {
    return {
      model: {
        type: DocumentType.SalesInvoice,
        customerCode:
          order.user?.id ??
          "" /* In Saleor Avatax plugin, the customer code is 0. In Taxes App, we set it to the user id. */,
        companyCode: this.providerConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: this.providerConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(this.providerConfig.address),
          // billing or shipping address?
          shipTo: avataxAddressFactory.fromSaleorAddress(order.billingAddress!),
        },
        currencyCode: order.total.currency,
        email: order.user?.email ?? "",
        lines: mapLines(order, this.providerConfig),
        date: new Date(order.created),
        discount: discountUtils.sumDiscounts(
          order.discounts.map((discount) => discount.amount.amount)
        ),
      },
    };
  };
}
