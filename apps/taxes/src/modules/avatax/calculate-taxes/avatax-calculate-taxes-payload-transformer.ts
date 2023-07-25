import { DocumentType } from "avatax/lib/enums/DocumentType";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

export class AvataxCalculateTaxesPayloadTransformer {
  private matchDocumentType(config: AvataxConfig): DocumentType {
    /*
     * * For calculating taxes, we always use DocumentType.SalesOrder because it doesn't cause transaction recording.
     * * The full flow is described here: https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/design-document-workflow/should-i-commit/
     * * config.isDocumentRecordingEnabledEnabled is used to determine if the transaction should be recorded (hence if the document type should be SalesOrder).
     * * Given that we never want to record the transaction in calculate taxes, we always return DocumentType.SalesOrder.
     */
    return DocumentType.SalesOrder;
  }

  transform(
    taxBase: TaxBaseFragment,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches
  ): CreateTransactionArgs {
    const payloadLinesTransformer = new AvataxCalculateTaxesPayloadLinesTransformer();

    return {
      model: {
        type: this.matchDocumentType(avataxConfig),
        customerCode: taxBase.sourceObject.user?.id ?? "",
        companyCode: avataxConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: avataxConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(avataxConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(taxBase.address!),
        },
        currencyCode: taxBase.currency,
        lines: payloadLinesTransformer.transform(taxBase, avataxConfig, matches),
        date: new Date(),
        discount: discountUtils.sumDiscounts(
          taxBase.discounts.map((discount) => discount.amount.amount)
        ),
      },
    };
  }
}
