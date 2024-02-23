import { TaxIncompleteWebhookPayloadError } from "../taxes/tax-error";
import { err, ok } from "neverthrow";
import { CalculateTaxesPayload } from "./calculate-taxes-payload";

/**
 * Verify if needed fields exist.
 * 1. Address can be empty, because webhooks can be triggered before address is assigned to checkout/order.
 * 2. Lines are also required.
 *
 * In both cases we return early, because we can't calculate anything yet
 */
export function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines.length) {
    return err(new TaxIncompleteWebhookPayloadError("No lines found in taxBase"));
  }

  if (!payload.taxBase.address) {
    return err(new TaxIncompleteWebhookPayloadError("No address found in taxBase"));
  }

  return ok(payload);
}
