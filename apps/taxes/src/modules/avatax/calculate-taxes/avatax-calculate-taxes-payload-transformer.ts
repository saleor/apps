import { DocumentType } from "avatax/lib/enums/DocumentType";
import { CalculateTaxesPayload } from "../../../pages/api/webhooks/checkout-calculate-taxes";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { avataxCustomerCode } from "../avatax-customer-code-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

export class AvataxCalculateTaxesPayloadTransformer {
  private matchDocumentType(config: AvataxConfig): DocumentType {
    /*
     * * For calculating taxes, we always use DocumentType.SalesOrder because it doesn't cause transaction recording.
     * * The full flow is described here: https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/design-document-workflow/should-i-commit/
     * * config.isDocumentRecordingEnabled is used to determine if the transaction should be recorded (hence if the document type should be SalesOrder).
     * * Given that we never want to record the transaction in calculate taxes, we always return DocumentType.SalesOrder.
     */
    return DocumentType.SalesOrder;
  }

  async transform(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): Promise<CreateTransactionArgs> {
    const payloadLinesTransformer = new AvataxCalculateTaxesPayloadLinesTransformer();
    const avataxClient = new AvataxClient(avataxConfig);
    const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });

    const entityUseCode = await entityTypeMatcher.match(
      payload.taxBase.sourceObject.avataxEntityCode,
    );

    const customerCode = avataxCustomerCode.resolve(payload.taxBase.sourceObject.user);

    return {
      model: {
        type: this.matchDocumentType(avataxConfig),
        entityUseCode,
        customerCode,
        companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(payload.taxBase.address!),
        },
        currencyCode: payload.taxBase.currency,
        lines: payloadLinesTransformer.transform(payload.taxBase, avataxConfig, matches),
        date: new Date(),
        discount: discountUtils.sumDiscounts(
          payload.taxBase.discounts.map((discount) => discount.amount.amount),
        ),
      },
    };
  }
}
