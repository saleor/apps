import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
<<<<<<< HEAD
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxOrderConfirmedCalculationDateResolver } from "./avatax-order-confirmed-calculation-date-resolver";
import { AvataxOrderConfirmedDocumentCodeResolver } from "./avatax-order-confirmed-document-code-resolver";
=======
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)

export const SHIPPING_ITEM_CODE = "Shipping";

export class AvataxOrderConfirmedPayloadTransformer {
  private matchDocumentType(config: AvataxConfig): DocumentType {
    if (!config.isDocumentRecordingEnabled) {
      // isDocumentRecordingEnabled = false changes all the DocTypes within your AvaTax requests to SalesOrder. This will stop any transaction from being recorded within AvaTax.
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  }
<<<<<<< HEAD

=======
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)
  async transform(
    order: OrderConfirmedSubscriptionFragment,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches
  ): Promise<CreateTransactionArgs> {
<<<<<<< HEAD
    const avataxClient = new AvataxClient(avataxConfig);

    const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
    const dateResolver = new AvataxOrderConfirmedCalculationDateResolver();
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });
    const documentCodeResolver = new AvataxOrderConfirmedDocumentCodeResolver();

    const entityUseCode = await entityTypeMatcher.match(order.avataxEntityCode);
    const date = dateResolver.resolve(order);
    const code = documentCodeResolver.resolve(order);

    return {
      model: {
        code,
=======
    const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
    const avataxClient = new AvataxClient(avataxConfig);
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });
    const entityUseCode = await entityTypeMatcher.match(order.avataxEntityCode);

    return {
      model: {
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode:
          order.user?.id ??
          "" /* In Saleor Avatax plugin, the customer code is 0. In Taxes App, we set it to the user id. */,
<<<<<<< HEAD
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
=======
        companyCode: avataxConfig.companyCode,
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)
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
<<<<<<< HEAD
        date,
=======
        date: new Date(order.created),
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)
        discount: discountUtils.sumDiscounts(
          order.discounts.map((discount) => discount.amount.amount)
        ),
      },
    };
  }
}
