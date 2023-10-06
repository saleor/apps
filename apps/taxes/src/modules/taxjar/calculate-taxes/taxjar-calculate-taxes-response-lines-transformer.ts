import Breakdown from "taxjar/dist/types/breakdown";
import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { TaxBadProviderResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import {
  TaxJarCalculateTaxesPayload,
  TaxJarCalculateTaxesResponse,
} from "./taxjar-calculate-taxes-adapter";

/*
 * TaxJar doesn't guarantee the order of the response items to match the payload items order.
 * The order needs to be maintained because the response items are by it in Saleor.
 */
export function matchPayloadLinesToResponseLines(
  payloadLines: TaxBaseFragment["lines"],
  responseLines: NonNullable<Breakdown["line_items"]>,
) {
  return payloadLines.map((payloadLine) => {
    const responseLine = responseLines.find((line) => line.id === payloadLine.sourceLine.id);

    if (!responseLine) {
      throw new Error(
        `Saleor product line with id ${payloadLine.sourceLine.id} not found in TaxJar response.`,
      );
    }

    return responseLine;
  });
}

export class TaxJarCalculateTaxesResponseLinesTransformer {
  transform(
    payload: TaxJarCalculateTaxesPayload,
    response: TaxForOrderRes,
  ): TaxJarCalculateTaxesResponse["lines"] {
    const responseLines = response.tax.breakdown?.line_items ?? [];

    const lines = matchPayloadLinesToResponseLines(payload.taxBase.lines, responseLines);

    return lines.map((line) => {
      const taxableAmount = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        line?.taxable_amount,
        new TaxBadProviderResponseError("Line taxable amount is required to calculate net amount"),
      );
      const taxCollectable = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        line?.tax_collectable,
        new TaxBadProviderResponseError("Line tax collectable is required to calculate net amount"),
      );
      const taxRate = taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        line?.combined_tax_rate,
        new TaxBadProviderResponseError(
          "Line combined tax rate is required to calculate net amount",
        ),
      );

      return {
        total_gross_amount: payload.taxBase.pricesEnteredWithTax
          ? taxableAmount
          : taxableAmount + taxCollectable,
        total_net_amount: payload.taxBase.pricesEnteredWithTax
          ? taxableAmount - taxCollectable
          : taxableAmount,
        tax_rate: taxRate,
      };
    });
  }
}
