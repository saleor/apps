import * as Sentry from "@sentry/nextjs";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { err, ok } from "neverthrow";

import { createLogger } from "../../../logger";
import { SaleorOrderConfirmedEvent } from "../../saleor";
import { TaxBadPayloadError } from "../../taxes/tax-error";
import { avataxAddressFactory } from "../address-factory";
import { AvataxCalculationDateResolver } from "../avatax-calculation-date-resolver";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { avataxCustomerCode } from "../avatax-customer-code-resolver";
import { AvataxDocumentCodeResolver } from "../avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { SaleorOrderToAvataxLinesTransformer } from "./saleor-order-to-avatax-lines-transformer";

export class AvataxOrderConfirmedPayloadTransformer {
  private logger = createLogger("AvataxOrderConfirmedPayloadTransformer");

  constructor(
    private saleorOrderToAvataxLinesTransformer: SaleorOrderToAvataxLinesTransformer,
    private avataxEntityTypeMatcher: AvataxEntityTypeMatcher,
    private avataxCalculationDateResolver: AvataxCalculationDateResolver,
    private avataxDocumentCodeResolver: AvataxDocumentCodeResolver,
  ) {}

  private matchDocumentType(config: AvataxConfig): DocumentType {
    if (!config.isDocumentRecordingEnabled) {
      // isDocumentRecordingEnabled = false changes all the DocTypes within your AvaTax requests to SalesOrder. This will stop any transaction from being recorded within AvaTax.
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  }
  private getSaleorAddress(confirmedOrderEvent: SaleorOrderConfirmedEvent) {
    const shippingAddress = confirmedOrderEvent.getOrderShippingAddress();
    const billingAddress = confirmedOrderEvent.getOrderBillingAddress();

    if (shippingAddress) {
      return ok(shippingAddress);
    }

    if (billingAddress) {
      this.logger.warn(
        "OrderConfirmedPayload has no shipping address, falling back to billing address",
      );

      return ok(billingAddress);
    }

    return err(new TaxBadPayloadError("OrderConfirmedPayload has no shipping or billing address"));
  }
  async transform({
    confirmedOrderEvent,
    avataxConfig,
    matches,
    discountsStrategy,
  }: {
    confirmedOrderEvent: SaleorOrderConfirmedEvent;
    avataxConfig: AvataxConfig;
    matches: AvataxTaxCodeMatches;
    discountsStrategy: PriceReductionDiscountsStrategy;
  }): Promise<CreateTransactionArgs> {
    const entityUseCode = await this.avataxEntityTypeMatcher.match(
      confirmedOrderEvent.getAvaTaxEntityCode(),
    );

    const date = this.avataxCalculationDateResolver.resolve(
      confirmedOrderEvent.getAvaTaxTaxCalculationDate(),
      confirmedOrderEvent.getOrderCreationDate(),
    );

    const code = this.avataxDocumentCodeResolver.resolve({
      avataxDocumentCode: confirmedOrderEvent.getAvaTaxDocumentCode(),
      orderId: confirmedOrderEvent.getOrderId(),
    });

    const customerCode = avataxCustomerCode.resolve({
      avataxCustomerCode: confirmedOrderEvent.getAvaTaxCustomerCode(),
      legacyAvataxCustomerCode: confirmedOrderEvent.getLegacyAvaTaxCustomerCode(),
      legacyUserId: confirmedOrderEvent.getUserId(),
      source: "Order",
    });

    const addressPayload = this.getSaleorAddress(confirmedOrderEvent);

    if (addressPayload.isErr()) {
      Sentry.captureException(addressPayload.error);
      this.logger.error("Error while transforming OrderConfirmedPayload", {
        error: addressPayload.error,
      });

      throw addressPayload.error;
    }

    return {
      model: {
        code,
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode,
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
        discount: discountsStrategy.getDiscountAmount(confirmedOrderEvent),
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(addressPayload.value),
        },
        currencyCode: confirmedOrderEvent.getOrderCurrency(),
        // we can fall back to empty string because email is not a required field
        email: confirmedOrderEvent.resolveUserEmailOrEmpty(),
        lines: this.saleorOrderToAvataxLinesTransformer.transform({
          confirmedOrderEvent,
          matches,
          avataxConfig,
          discountsStrategy,
        }),
        date,
      },
    };
  }
}
