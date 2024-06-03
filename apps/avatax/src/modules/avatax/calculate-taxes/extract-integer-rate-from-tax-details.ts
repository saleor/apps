import { TransactionLineDetailModel } from "avatax/lib/models/TransactionLineDetailModel";

/**
 * Saleor expects tax rate to be returned in integer value
 * https://docs.saleor.io/docs/3.x/developer/extending/webhooks/synchronous-events/tax#fields-1
 */
export function extractIntegerRateFromTaxDetails(details: TransactionLineDetailModel[]) {
  const rawSum = details.reduce((acc, detailModel) => acc + (detailModel.rate ?? 0), 0) * 100;

  return parseFloat(rawSum.toPrecision(2));
}
