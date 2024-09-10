import { DocumentType } from "avatax/lib/enums/DocumentType";

import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";
import { avataxAddressFactory } from "../address-factory";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { avataxCustomerCode } from "../avatax-customer-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

export class AvataxCalculateTaxesPayloadTransformer {
  constructor(
    private avaTaxCalculateTaxesPayloadLinesTransformer: AvataxCalculateTaxesPayloadLinesTransformer,
    private avataxEntityTypeMatcher: AvataxEntityTypeMatcher,
  ) {}

  private matchDocumentType(config: AvataxConfig): DocumentType {
    /*
     * * For calculating taxes, we always use DocumentType.SalesOrder because it doesn't cause transaction recording.
     * * The full flow is described here: https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/design-document-workflow/should-i-commit/
     * * config.isDocumentRecordingEnabled is used to determine if the transaction should be recorded (hence if the document type should be SalesOrder).
     * * Given that we never want to record the transaction in calculate taxes, we always return DocumentType.SalesOrder.
     */
    return DocumentType.SalesOrder;
  }

  /**
   * https://linear.app/saleor/issue/SHOPX-1313/tech-debt-avatax-refactor-async-transformers
   */
  async transform(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches,
    discountsStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
  ): Promise<CreateTransactionArgs> {
    const entityUseCode = await this.avataxEntityTypeMatcher.match(
      payload.taxBase.sourceObject.avataxEntityCode,
    );

    const customerCode = avataxCustomerCode.resolve({
      avataxCustomerCode: payload.taxBase.sourceObject.avataxCustomerCode,
      legacyAvataxCustomerCode: payload.taxBase.sourceObject.user?.avataxCustomerCode,
      legacyUserId: payload.taxBase.sourceObject.user?.id,
      source: payload.taxBase.sourceObject.__typename,
    });

    return {
      model: {
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode,
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
        discount: discountsStrategy.getDiscountAmount(payload.taxBase.discounts),
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(payload.taxBase.address!),
        },
        currencyCode: payload.taxBase.currency,
        lines: this.avaTaxCalculateTaxesPayloadLinesTransformer.transformWithDiscountType(
          payload.taxBase,
          avataxConfig,
          matches,
          discountsStrategy,
        ),
        date: new Date(),
      },
    };
  }
}
