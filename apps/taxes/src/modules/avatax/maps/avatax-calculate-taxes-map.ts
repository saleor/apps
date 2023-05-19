import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { TaxBaseFragment } from "../../../../generated/graphql";

import { DocumentType } from "avatax/lib/enums/DocumentType";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { numbers } from "../../taxes/numbers";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { avataxAddressFactory } from "./address-factory";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";

/**
 * * Shipping is a regular line item in Avatax
 * https://developer.avalara.com/avatax/dev-guide/shipping-and-handling/taxability-of-shipping-charges/
 */
export const SHIPPING_ITEM_CODE = "Shipping";

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

export type AvataxCalculateTaxesMapPayloadArgs = {
  taxBase: TaxBaseFragment;
  channel: ChannelConfig;
  config: AvataxConfig;
};

const mapPayload = (props: AvataxCalculateTaxesMapPayloadArgs): CreateTransactionArgs => {
  const { taxBase, channel, config } = props;

  return {
    model: {
      type: DocumentType.SalesOrder,
      customerCode: taxBase.sourceObject.user?.id ?? "",
      companyCode: config.companyCode,
      // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
      commit: config.isAutocommit,
      addresses: {
        shipFrom: avataxAddressFactory.fromChannelAddress(channel.address),
        shipTo: avataxAddressFactory.fromSaleorAddress(taxBase.address!),
      },
      currencyCode: taxBase.currency,
      lines: mapPayloadLines(taxBase, config),
      date: new Date(),
    },
  };
};

export function mapResponseShippingLine(
  transaction: TransactionModel
): Pick<
  CalculateTaxesResponse,
  "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
> {
  const shippingLine = transaction.lines?.find((line) => line.itemCode === SHIPPING_ITEM_CODE);

  if (!shippingLine) {
    return {
      shipping_price_gross_amount: 0,
      shipping_price_net_amount: 0,
      shipping_tax_rate: 0,
    };
  }

  if (!shippingLine.isItemTaxable) {
    return {
      shipping_price_gross_amount: taxProviderUtils.resolveOptionalOrThrow(
        shippingLine.lineAmount,
        new Error("shippingLine.lineAmount is undefined")
      ),
      shipping_price_net_amount: taxProviderUtils.resolveOptionalOrThrow(
        shippingLine.lineAmount,
        new Error("shippingLine.lineAmount is undefined")
      ),
      /*
       * avatax doesnt return combined tax rate
       * // todo: calculate percentage tax rate
       */
      shipping_tax_rate: 0,
    };
  }

  const shippingTaxCalculated = taxProviderUtils.resolveOptionalOrThrow(
    shippingLine.taxCalculated,
    new Error("shippingLine.taxCalculated is undefined")
  );
  const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrow(
    shippingLine.taxableAmount,
    new Error("shippingLine.taxableAmount is undefined")
  );
  const shippingGrossAmount = numbers.roundFloatToTwoDecimals(
    shippingTaxableAmount + shippingTaxCalculated
  );

  return {
    shipping_price_gross_amount: shippingGrossAmount,
    shipping_price_net_amount: shippingTaxableAmount,
    shipping_tax_rate: 0,
  };
}

export function mapResponseProductLines(
  transaction: TransactionModel
): CalculateTaxesResponse["lines"] {
  const productLines = transaction.lines?.filter((line) => line.itemCode !== SHIPPING_ITEM_CODE);

  return (
    productLines?.map((line) => {
      if (!line.isItemTaxable) {
        return {
          total_gross_amount: taxProviderUtils.resolveOptionalOrThrow(
            line.lineAmount,
            new Error("line.lineAmount is undefined")
          ),
          total_net_amount: taxProviderUtils.resolveOptionalOrThrow(
            line.lineAmount,
            new Error("line.lineAmount is undefined")
          ),
          tax_rate: 0,
        };
      }

      const lineTaxCalculated = taxProviderUtils.resolveOptionalOrThrow(
        line.taxCalculated,
        new Error("line.taxCalculated is undefined")
      );
      const lineTotalNetAmount = taxProviderUtils.resolveOptionalOrThrow(
        line.taxableAmount,
        new Error("line.taxableAmount is undefined")
      );
      const lineTotalGrossAmount = numbers.roundFloatToTwoDecimals(
        lineTotalNetAmount + lineTaxCalculated
      );

      return {
        total_gross_amount: lineTotalGrossAmount,
        total_net_amount: lineTotalNetAmount,
        /*
         * avatax doesnt return combined tax rate
         * // todo: calculate percentage tax rate
         */ tax_rate: 0,
      };
    }) ?? []
  );
}

const mapResponse = (transaction: TransactionModel): CalculateTaxesResponse => {
  const shipping = mapResponseShippingLine(transaction);

  return {
    ...shipping,
    lines: mapResponseProductLines(transaction),
  };
};

export const avataxCalculateTaxesMaps = {
  mapPayload,
  mapResponse,
};
