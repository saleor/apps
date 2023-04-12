import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { TaxBaseFragment } from "../../../../generated/graphql";

import { DocumentType } from "avatax/lib/enums/DocumentType";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { taxLineResolver } from "../../taxes/tax-line-resolver";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { mapChannelAddressToAvataxAddress, mapSaleorAddressToAvataxAddress } from "./address-map";
import { numbers } from "../../taxes/numbers";

export const SHIPPING_ITEM_CODE = "Shipping";

export function mapLines(taxBase: TaxBaseFragment): LineItemModel[] {
  const productLines = taxBase.lines.map((line) => ({
    amount: line.unitPrice.amount,
    taxIncluded: line.chargeTaxes,
    // todo: get from tax code matcher
    taxCode: taxLineResolver.getLineTaxCode(line),
    quantity: line.quantity,
  }));

  if (taxBase.shippingPrice.amount !== 0) {
    // * In Avatax, shipping is a regular line
    const shippingLine: LineItemModel = {
      amount: taxBase.shippingPrice.amount,
      itemCode: SHIPPING_ITEM_CODE,
      quantity: 1,
    };

    return [...productLines, shippingLine];
  }

  return productLines;
}

export type AvataxCalculateTaxesMapPayloadProps = {
  taxBase: TaxBaseFragment;
  channel: ChannelConfig;
  config: AvataxConfig;
};

const mapPayload = (props: AvataxCalculateTaxesMapPayloadProps): CreateTransactionArgs => {
  const { taxBase, channel, config } = props;
  return {
    model: {
      type: DocumentType.SalesOrder,
      customerCode: taxBase.sourceObject.user?.id ?? "",
      companyCode: config.companyCode,
      // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
      commit: config.isAutocommit,
      addresses: {
        shipFrom: mapChannelAddressToAvataxAddress(channel.address),
        shipTo: mapSaleorAddressToAvataxAddress(taxBase.address!),
      },
      currencyCode: taxBase.currency,
      lines: mapLines(taxBase),
      date: new Date(),
    },
  };
};

const mapResponse = (transaction: TransactionModel): CalculateTaxesResponse => {
  const shippingLine = transaction.lines?.find((line) => line.itemCode === SHIPPING_ITEM_CODE);
  const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);
  const shippingGrossAmount = shippingLine?.taxableAmount ?? 0;
  const shippingTaxCalculated = shippingLine?.taxCalculated ?? 0;
  const shippingNetAmount = numbers.roundFloatToTwoDecimals(
    shippingGrossAmount - shippingTaxCalculated
  );

  return {
    shipping_price_gross_amount: shippingGrossAmount,
    shipping_price_net_amount: shippingNetAmount,
    // todo: add shipping tax rate
    shipping_tax_rate: 0,
    lines:
      productLines?.map((line) => {
        const lineTaxCalculated = line.taxCalculated ?? 0;
        const lineTotalNetAmount = line.taxableAmount ?? 0;
        const lineTotalGrossAmount = numbers.roundFloatToTwoDecimals(
          lineTotalNetAmount + lineTaxCalculated
        );
        return {
          total_gross_amount: lineTotalGrossAmount,
          total_net_amount: lineTotalNetAmount,
          // todo: add tax rate
          tax_rate: 0,
        };
      }) ?? [],
  };
};

export const avataxCalculateTaxes = {
  mapPayload,
  mapResponse,
};
