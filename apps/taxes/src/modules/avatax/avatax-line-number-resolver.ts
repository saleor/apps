import { OrderLineFragment } from "../../../generated/graphql";

/**
 * @description Makes sure we use the same line number for creating & refunding transaction. AvaTax requires that the line number is <= 50 characters.
 */
export function resolveAvataxTransactionLineNumber(line: OrderLineFragment) {
  return line.id.substring(0, 50);
}
