import { DocumentType } from "avatax/lib/enums/DocumentType";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";

export class AvataxCalculateTaxesPayloadTransformer {
  transform(
    taxBase: TaxBaseFragment,
    avataxConfig: AvataxConfig,
    matches: AvataxTaxCodeMatches
  ): CreateTransactionArgs {
    const payloadLinesTransformer = new AvataxCalculateTaxesPayloadLinesTransformer();

    return {
      model: {
        type: DocumentType.SalesOrder,
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
