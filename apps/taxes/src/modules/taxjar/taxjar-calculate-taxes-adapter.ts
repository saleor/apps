import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { TaxBaseFragment } from "../../../generated/graphql";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { distributeDiscount } from "../taxes/distribute-discount";
import { numbers } from "../taxes/numbers";
import { taxProviderUtils } from "../taxes/tax-provider-utils";
import { CalculateTaxesResponse } from "../taxes/tax-provider-webhook";
import { taxJarAddressFactory } from "./address-factory";
import { FetchTaxForOrderArgs, TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { WebhookAdapter } from "../taxes/tax-webhook-adapter";

type Payload = {
  taxBase: TaxBaseFragment;
  channel: ChannelConfig;
};

type Target = FetchTaxForOrderArgs;
type Response = CalculateTaxesResponse;

export class TaxJarCalculateTaxesPayloadTransformer {
  private mapLines(taxBase: Payload["taxBase"]): Target["params"]["line_items"] {
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
        // todo: replace
        chargeTaxes: true,
        // todo: get from tax code matcher
        taxCode: "",
        quantity: line.quantity,
        // todo: clarify if I need to include discount in total amount
        totalAmount: Number(line.totalPrice.amount),
        unitAmount: Number(line.unitPrice.amount),
        discount: discountAmount,
      };
    });
  }

  transform({ taxBase, channel }: Payload): Target {
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
        line_items: this.mapLines(taxBase),
      },
    };

    return taxParams;
  }
}

export class TaxJarCalculateTaxesResponseTransformer {
  private mapLines(res: TaxForOrderRes["tax"]): Response["lines"] {
    const lines = res.breakdown?.line_items ?? [];

    return lines.map((line) => ({
      total_gross_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount + line.tax_collectable,
        new Error("Taxable amount and tax collectable are required to calculate gross amount")
      ),
      total_net_amount: taxProviderUtils.resolveOptionalOrThrow(
        line.taxable_amount,
        new Error("Taxable amount is required to calculate net amount")
      ),
      tax_rate: line.combined_tax_rate ?? 0,
    }));
  }

  private mapShipping(
    res: TaxForOrderRes["tax"]
  ): Pick<
    Response,
    "shipping_price_gross_amount" | "shipping_price_net_amount" | "shipping_tax_rate"
  > {
    const shippingDetails = res.breakdown?.shipping;
    const shippingTaxableAmount = taxProviderUtils.resolveOptionalOrThrow(
      shippingDetails?.taxable_amount,
      new Error("Shipping taxable amount is required to calculate gross amount")
    );

    const shippingPriceGross =
      shippingTaxableAmount +
      taxProviderUtils.resolveOptionalOrThrow(
        shippingDetails?.tax_collectable,
        new Error("Shipping tax collectable is required to calculate gross amount")
      );
    const shippingPriceNet = shippingTaxableAmount;
    const shippingTaxRate = shippingDetails?.combined_tax_rate ?? 0;

    return {
      shipping_price_gross_amount: numbers.roundFloatToTwoDecimals(shippingPriceGross),
      shipping_price_net_amount: numbers.roundFloatToTwoDecimals(shippingPriceNet),
      shipping_tax_rate: shippingTaxRate,
    };
  }

  transform(response: TaxForOrderRes): Response {
    const shipping = this.mapShipping(response.tax);

    return {
      ...shipping,
      lines: this.mapLines(response.tax),
    };
  }
}

export class TaxJarCalculateTaxesAdapter implements WebhookAdapter<Payload, Response> {
  constructor(private readonly config: TaxJarConfig) {}

  async send(payload: Payload): Promise<Response> {
    const payloadTransformer = new TaxJarCalculateTaxesPayloadTransformer();
    const target = payloadTransformer.transform(payload);

    const client = new TaxJarClient(this.config);
    const response = await client.fetchTaxForOrder(target);

    const responseTransformer = new TaxJarCalculateTaxesResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    return transformedResponse;
  }
}
