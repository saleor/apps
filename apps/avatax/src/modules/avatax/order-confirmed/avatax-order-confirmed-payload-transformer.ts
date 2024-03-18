import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { AvataxCalculationDateResolver } from "../avatax-calculation-date-resolver";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { avataxCustomerCode } from "../avatax-customer-code-resolver";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { err, ok } from "neverthrow";
import * as Sentry from "@sentry/nextjs";
import { TaxBadPayloadError } from "../../taxes/tax-error";
import { createLogger } from "@saleor/apps-logger";

export class AvataxOrderConfirmedPayloadTransformer {
  private logger = createLogger("AvataxOrderConfirmedPayloadTransformer");

  private matchDocumentType(config: AvataxConfig): DocumentType {
    if (!config.isDocumentRecordingEnabled) {
      // isDocumentRecordingEnabled = false changes all the DocTypes within your AvaTax requests to SalesOrder. This will stop any transaction from being recorded within AvaTax.
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  }
  private getSaleorAddress(order: OrderConfirmedSubscriptionFragment) {
    if (order.shippingAddress) {
      return ok(order.shippingAddress);
    }

    if (order.billingAddress) {
      const message =
        "OrderConfirmedPayload has no shipping address, falling back to billing address";

      this.logger.warn(message);
      Sentry.captureMessage(message);

      return ok(order.billingAddress);
    }

    return err(new TaxBadPayloadError("OrderConfirmedPayload has no shipping or billing address"));
  }
  async transform(
    order: OrderConfirmedSubscriptionFragment,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): Promise<CreateTransactionArgs> {
    const avataxClient = new AvataxClient(avataxConfig);

    const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });
    const dateResolver = new AvataxCalculationDateResolver();
    const documentCodeResolver = new AvataxDocumentCodeResolver();

    const entityUseCode = await entityTypeMatcher.match(order.avataxEntityCode);
    const date = dateResolver.resolve(order.avataxTaxCalculationDate, order.created);
    const code = documentCodeResolver.resolve({
      avataxDocumentCode: order.avataxDocumentCode,
      orderId: order.id,
    });
    const customerCode = avataxCustomerCode.resolve(order.user);
    const addressPayload = this.getSaleorAddress(order);

    if (addressPayload.isErr()) {
      Sentry.captureException(addressPayload.error);
      this.logger.error("Error while transforming OrderConfirmedPayload", addressPayload.error);

      throw addressPayload.error;
    }

    return {
      model: {
        code,
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode,
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(addressPayload.value),
        },
        currencyCode: order.total.currency,
        // we can fall back to empty string because email is not a required field
        email: order.user?.email ?? order.userEmail ?? "",
        lines: linesTransformer.transform(order, avataxConfig, matches),
        date,
        discount: discountUtils.sumDiscounts(
          order.discounts.map((discount) => discount.amount.amount),
        ),
      },
    };
  }
}
