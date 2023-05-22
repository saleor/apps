import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { TaxBaseFragment, TaxBaseLineFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { FetchTaxForOrderArgs } from "../taxjar-client";
import { TaxJarConfig } from "../taxjar-config";
import { taxJarAddressFactory } from "./address-factory";
import { numbers } from "../../taxes/numbers";

function formatCalculatedAmount(amount: number) {
  return Number(amount.toFixed(2));
}

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

// ? shouldn't it be used in all providers?
export function distributeDiscount(discountSum: number, prices: number[]) {
  const totalNumbers = prices.length;
  const totalSum = prices.reduce((sum, number) => sum + number, 0);

  if (discountSum > totalSum) {
    throw new Error("Discount cannot be greater than total sum");
  }

  const discountRatio = discountSum / totalSum;
  const discountedNumbers = [];

  for (let i = 0; i < totalNumbers; i++) {
    const number = prices[i];
    const discountAmount = number * discountRatio;
    const discountedNumber = (number - discountAmount).toFixed(2);

    discountedNumbers.push(numbers.roundFloatToTwoDecimals(Number(discountedNumber)));
  }

  return discountedNumbers;
}

const prepareLinesWithDiscountPayload = (
  taxBase: TaxBaseFragment
): Array<FetchTaxesLinePayload> => {
  const { lines, discounts } = taxBase;
  const discountSum = discounts?.reduce(
    (total, current) => total + Number(current.amount.amount),
    0
  );
  const linePrices = lines.map((line) => Number(line.totalPrice.amount));
  const distributedDiscounts = distributeDiscount(discountSum, linePrices);

  return lines.map((line, index) => {
    const discountAmount = distributedDiscounts[index];

    return {
      id: line.sourceLine.id,
      chargeTaxes: true,
      // todo: get from tax code matcher
      taxCode: "",
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
  const linesWithDiscount = prepareLinesWithDiscountPayload(payload);
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

function mapPayloadLines(lines: FetchTaxesLinePayload[]) {
  return lines.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    product_tax_code: line.taxCode || undefined,
    unit_price: line.unitAmount,
    discount: line.discount,
  }));
}

export type TaxJarCalculateTaxesMapPayloadArgs = {
  taxBase: TaxBaseFragment;
  channel: ChannelConfig;
  config: TaxJarConfig;
};

const mapPayload = ({
  taxBase,
  channel,
}: TaxJarCalculateTaxesMapPayloadArgs): FetchTaxForOrderArgs => {
  const linesWithDiscount = prepareLinesWithDiscountPayload(taxBase);
  const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);
  const fromAddress = taxJarAddressFactory.fromChannelAddress(channel.address);

  if (!taxBase.address) {
    throw new Error("Customer address is required to calculate taxes in TaxJar.");
  }

  const toAddress = taxJarAddressFactory.fromSaleorAddress(taxBase.address);

  const taxParams = {
    params: {
      ...fromAddress,
      ...toAddress,
      shipping: taxBase.shippingPrice.amount,
      line_items: mapPayloadLines(linesWithChargeTaxes),
    },
  };

  return taxParams;
};

export const taxJarCalculateTaxesMaps = {
  mapPayload,
  mapResponse,
};
