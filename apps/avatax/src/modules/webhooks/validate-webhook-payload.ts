import { err, ok } from "neverthrow";
import { TaxIncompletePayloadErrors } from "../taxes/tax-error";
import { CalculateTaxesPayload } from "./payloads/calculate-taxes-payload";

/**
 * Verify if needed fields exist.
 * 1. Address can be empty, because webhooks can be triggered before address is assigned to checkout/order.
 * 2. Lines are also required.
 *
 * In both cases we return early, because we can't calculate anything yet
 */
export function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines.length) {
    return err(new TaxIncompletePayloadErrors.MissingLinesError("No lines found in taxBase"));
  }

  if (!payload.taxBase.address) {
    return err(new TaxIncompletePayloadErrors.MissingAddressError("No address found in taxBase"));
  }

  return ok(payload);
}
