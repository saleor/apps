import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { TaxBaseFragment } from "../../../generated/graphql";

import { ChannelConfig } from "../channels-configuration/channels-config";
import { taxLineResolver } from "../taxes/tax-line-resolver";
import { ResponseTaxPayload } from "../taxes/types";
import { AvataxConfig } from "./avatax-config";
import { DocumentType } from "avatax/lib/enums/DocumentType";

const SHIPPING_ITEM_CODE = "Shipping";

const formatCalculatedAmount = (amount: number) => {
  return Number(amount.toFixed(2));
};

const prepareLines = (taxBase: TaxBaseFragment): LineItemModel[] => {
  const productLines = taxBase.lines.map((line) => ({
    amount: line.unitPrice.amount,
    taxIncluded: line.chargeTaxes,
    taxCode: taxLineResolver.getLineTaxCode(line),
    quantity: line.quantity,
    itemCode: "Product",
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
};

const createCommonTransactionModel = (
  taxBase: TaxBaseFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): Omit<CreateTransactionModel, "type"> => {
  return {
    customerCode: "0", // todo: replace with customer code
    companyCode: config.companyName,
    // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
    commit: config.isAutocommit,
    addresses: {
      shipFrom: {
        line1: channel.address.street,
        city: channel.address.city,
        region: channel.address.state,
        postalCode: channel.address.zip,
        country: channel.address.country,
      },
      shipTo: {
        line1: taxBase.address?.streetAddress1,
        line2: taxBase.address?.streetAddress2,
        city: taxBase.address?.city,
        country: taxBase.address?.country.code,
        postalCode: taxBase.address?.postalCode,
        region: taxBase.address?.countryArea,
      },
    },
    lines: prepareLines(taxBase),
    // todo: replace date with order/checkout date
    date: new Date(),
  };
};

const prepareSalesOrder = (
  taxBase: TaxBaseFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): CreateTransactionModel => {
  return {
    type: DocumentType.SalesOrder,
    ...createCommonTransactionModel(taxBase, channel, config),
  };
};

const prepareSalesInvoice = (
  taxBase: TaxBaseFragment,
  channel: ChannelConfig,
  config: AvataxConfig
): CreateTransactionModel => {
  return {
    type: DocumentType.SalesInvoice,
    ...createCommonTransactionModel(taxBase, channel, config),
  };
};

const prepareResponse = (transaction: TransactionModel): ResponseTaxPayload => {
  const shippingLine = transaction.lines?.find((line) => line.itemCode === SHIPPING_ITEM_CODE);

  const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);

  const shippingGrossAmount = shippingLine?.taxableAmount ?? 0;
  const shippingTaxCalculated = shippingLine?.taxCalculated ?? 0;
  const shippingNetAmount = formatCalculatedAmount(shippingGrossAmount - shippingTaxCalculated);

  return {
    shipping_price_gross_amount: shippingGrossAmount,
    shipping_price_net_amount: shippingNetAmount,
    // todo: add shipping tax rate
    shipping_tax_rate: 0,
    lines:
      productLines?.map((line) => {
        const lineTaxCalculated = line.taxCalculated ?? 0;
        const lineTotalNetAmount = line.taxableAmount ?? 0;
        const lineTotalGrossAmount = formatCalculatedAmount(lineTotalNetAmount + lineTaxCalculated);
        return {
          total_gross_amount: lineTotalGrossAmount,
          total_net_amount: lineTotalNetAmount,
          // todo: add tax rate
          tax_rate: 0,
        };
      }) ?? [],
  };
};

export const avataxCalculate = {
  prepareSalesOrder,
  prepareSalesInvoice,
  prepareResponse,
  prepareLines,
};
