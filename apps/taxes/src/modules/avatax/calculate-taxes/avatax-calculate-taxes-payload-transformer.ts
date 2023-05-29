import { DocumentType } from "avatax/lib/enums/DocumentType";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";
import { avataxAddressFactory } from "../address-factory";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { SHIPPING_ITEM_CODE } from "./avatax-calculate-taxes-adapter";

export function mapPayloadLines(taxBase: TaxBaseFragment, config: AvataxConfig): LineItemModel[] {
  const isDiscounted = taxBase.discounts.length > 0;
  const productLines: LineItemModel[] = taxBase.lines.map((line) => ({
    amount: line.totalPrice.amount,
    taxIncluded: taxBase.pricesEnteredWithTax,
    // todo: get from tax code matcher
    taxCode: "",
    quantity: line.quantity,
    discounted: isDiscounted,
  }));

  if (taxBase.shippingPrice.amount !== 0) {
    // * In Avatax, shipping is a regular line
    const shippingLine: LineItemModel = {
      amount: taxBase.shippingPrice.amount,
      itemCode: SHIPPING_ITEM_CODE,
      taxCode: config.shippingTaxCode,
      quantity: 1,
      taxIncluded: taxBase.pricesEnteredWithTax,
      discounted: isDiscounted,
    };

    return [...productLines, shippingLine];
  }

  return productLines;
}

export class AvataxCalculateTaxesPayloadTransformer {
  transform({
    taxBase,
    providerConfig,
  }: {
    taxBase: TaxBaseFragment;
    providerConfig: AvataxConfig;
  }): CreateTransactionArgs {
    return {
      model: {
        type: DocumentType.SalesOrder,
        customerCode: taxBase.sourceObject.user?.id ?? "",
        companyCode: providerConfig.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: providerConfig.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(providerConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(taxBase.address!),
        },
        currencyCode: taxBase.currency,
        lines: mapPayloadLines(taxBase, providerConfig),
        date: new Date(),
        discount: discountUtils.sumDiscounts(
          taxBase.discounts.map((discount) => discount.amount.amount)
        ),
      },
    };
  }
}
