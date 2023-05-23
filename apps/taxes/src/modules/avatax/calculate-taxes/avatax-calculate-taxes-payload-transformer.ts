import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-config";
import { avataxAddressFactory } from "../address-factory";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { SHIPPING_ITEM_CODE, Payload, Target } from "./avatax-calculate-taxes-adapter";

export function mapPayloadLines(taxBase: TaxBaseFragment, config: AvataxConfig): LineItemModel[] {
  const productLines = taxBase.lines.map((line) => ({
    amount: line.totalPrice.amount,
    taxIncluded: taxBase.pricesEnteredWithTax,
    // todo: get from tax code matcher
    taxCode: "",
    quantity: line.quantity,
  }));

  if (taxBase.shippingPrice.amount !== 0) {
    // * In Avatax, shipping is a regular line
    const shippingLine: LineItemModel = {
      amount: taxBase.shippingPrice.amount,
      itemCode: SHIPPING_ITEM_CODE,
      taxCode: config.shippingTaxCode,
      quantity: 1,
      taxIncluded: taxBase.pricesEnteredWithTax,
    };

    return [...productLines, shippingLine];
  }

  return productLines;
}

export class AvataxCalculateTaxesPayloadTransformer {
  transform(props: Payload): Target {
    const { taxBase, channelConfig, config } = props;

    return {
      model: {
        type: DocumentType.SalesOrder,
        customerCode: taxBase.sourceObject.user?.id ?? "",
        companyCode: config.companyCode,
        // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
        commit: config.isAutocommit,
        addresses: {
          shipFrom: avataxAddressFactory.fromChannelAddress(channelConfig.address),
          shipTo: avataxAddressFactory.fromSaleorAddress(taxBase.address!),
        },
        currencyCode: taxBase.currency,
        lines: mapPayloadLines(taxBase, config),
        date: new Date(),
      },
    };
  }
}
