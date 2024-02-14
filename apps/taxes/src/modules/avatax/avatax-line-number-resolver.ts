import { OrderLineFragment } from "../../../generated/graphql";

/**
 * @description Makes sure we use the same line number for creating & refunding transaction. AvaTax requires that the line number is <= 50 characters.
 */
export function resolveAvataxTransactionLineNumber(line: OrderLineFragment) {
  // get last 50 characters of line.id
  return line.id.slice(-50);
}
