import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderCreatedPayloadLinesTransformer } from "./avatax-order-created-payload-lines-transformer";

export const SHIPPING_ITEM_CODE = "Shipping";

export class AvataxOrderCreatedPayloadTransformer {
  transform(
    order: OrderCreatedSubscriptionFragment,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches
  ): CreateTransactionArgs {
    const linesTransformer = new AvataxOrderCreatedPayloadLinesTransformer();

    return {
      model: {
        type: DocumentType.SalesInvoice,
        customerCode:
          order.user?.id ??
          "" /* In Saleor Avatax plugin, the customer code is 0. In Taxes App, we set it to the user id. */,
        companyCode: avataxConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          // billing or shipping address?
          shipTo: avataxAddressFactory.fromSaleorAddress(order.billingAddress!),
        },
        currencyCode: order.total.currency,
        email: order.user?.email ?? "",
        lines: linesTransformer.transform(order, avataxConfig, matches),
        date: new Date(order.created),
        discount: discountUtils.sumDiscounts(
          order.discounts.map((discount) => discount.amount.amount)
        ),
      },
    };
  }
}
