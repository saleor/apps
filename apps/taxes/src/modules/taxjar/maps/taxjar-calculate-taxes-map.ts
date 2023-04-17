import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import {
  TaxBaseFragment,
  TaxBaseLineFragment,
  TaxDiscountFragment,
} from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { taxLineResolver } from "../../taxes/tax-line-resolver";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { FetchTaxForOrderArgs } from "../taxjar-client";

const formatCalculatedAmount = (amount: number) => {
  return Number(amount.toFixed(2));
};

// * This type is related to `TaxLineItem` from TaxJar. It should be unified.
type FetchTaxesLinePayload = {
  id: string;
  quantity: number;
  taxCode?: string | null;
  discount: number;
  chargeTaxes: boolean;
  unitAmount: number;
  totalAmount: number;
};

const prepareLinesWithDiscountPayload = (
  lines: Array<TaxBaseLineFragment>,
  discounts: Array<TaxDiscountFragment>
): Array<FetchTaxesLinePayload> => {
  const allLinesTotal = lines.reduce(
    (total, current) => total + Number(current.totalPrice.amount),
    0
  );
  const discountsSum =
    discounts?.reduce((total, current) => total + Number(current.amount.amount), 0) || 0;

  // Make sure that totalDiscount doesn't exceed a sum of all lines
  const totalDiscount = discountsSum <= allLinesTotal ? discountsSum : allLinesTotal;

  return lines.map((line) => {
    const discountAmount = taxLineResolver.getLineDiscount(line, totalDiscount, allLinesTotal);
    const taxCode = taxLineResolver.getLineTaxCode(line);

    return {
      id: line.sourceLine.id,
      chargeTaxes: line.chargeTaxes,
      taxCode: taxCode,
      quantity: line.quantity,
      totalAmount: Number(line.totalPrice.amount),
      unitAmount: Number(line.unitPrice.amount),
      discount: discountAmount,
    };
  });
};

const mapResponse = (
  payload: TaxBaseFragment,
  response: TaxForOrderRes
): CalculateTaxesResponse => {
  const linesWithDiscount = prepareLinesWithDiscountPayload(payload.lines, payload.discounts);
  const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);

  const taxResponse = linesWithChargeTaxes.length !== 0 ? response : undefined;
  const taxDetails = taxResponse?.tax.breakdown;
  /**
   * todo: investigate
   * ! There is no shipping in tax.breakdown from TaxJar.
   */
  const shippingDetails = taxDetails?.shipping;

  const shippingPriceGross = shippingDetails
    ? shippingDetails.taxable_amount + shippingDetails.tax_collectable
    : payload.shippingPrice.amount;
  const shippingPriceNet = shippingDetails
    ? shippingDetails.taxable_amount
    : payload.shippingPrice.amount;
  const shippingTaxRate = shippingDetails ? shippingDetails.combined_tax_rate : 0;
  // ! It appears shippingTaxRate is always 0 from TaxJar.

  return {
    shipping_price_gross_amount: formatCalculatedAmount(shippingPriceGross),
    shipping_price_net_amount: formatCalculatedAmount(shippingPriceNet),
    shipping_tax_rate: shippingTaxRate,
    /**
     * lines order needs to be the same as for received payload.
     * lines that have chargeTaxes === false will have returned default value
     */
    lines: linesWithDiscount.map((line) => {
      const lineTax = taxDetails?.line_items?.find((l) => l.id === line.id);
      const totalGrossAmount = lineTax
        ? lineTax.taxable_amount + lineTax.tax_collectable
        : line.totalAmount - line.discount;
      const totalNetAmount = lineTax ? lineTax.taxable_amount : line.totalAmount - line.discount;
      const taxRate = lineTax ? lineTax.combined_tax_rate : 0;

      return {
        total_gross_amount: formatCalculatedAmount(totalGrossAmount),
        total_net_amount: formatCalculatedAmount(totalNetAmount),
        tax_rate: taxRate ?? 0,
      };
    }),
  };
};

const mapPayload = (taxBase: TaxBaseFragment, channel: ChannelConfig): FetchTaxForOrderArgs => {
  const linesWithDiscount = prepareLinesWithDiscountPayload(taxBase.lines, taxBase.discounts);
  const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);

  const taxParams = {
    params: {
      from_country: channel.address.country,
      from_zip: channel.address.zip,
      from_state: channel.address.state,
      from_city: channel.address.city,
      from_street: channel.address.street,
      to_country: taxBase.address!.country.code,
      to_zip: taxBase.address!.postalCode,
      to_state: taxBase.address!.countryArea,
      to_city: taxBase.address!.city,
      to_street: `${taxBase.address!.streetAddress1} ${taxBase.address!.streetAddress2}`,
      shipping: taxBase.shippingPrice.amount,
      line_items: linesWithChargeTaxes.map((line) => ({
        id: line.id,
        quantity: line.quantity,
        product_tax_code: line.taxCode || undefined,
        unit_price: line.unitAmount,
        discount: line.discount,
      })),
    },
  };

  return taxParams;
};

export const taxJarCalculateTaxesMaps = {
  mapPayload,
  mapResponse,
};
