import { TransactionLineDetailModel } from "avatax/lib/models/TransactionLineDetailModel";

export function extractRateFromTaxDetails(details: TransactionLineDetailModel[]) {
  const rawSum = details.reduce((acc, detailModel) => acc + (detailModel.rate ?? 0), 0);

  return parseFloat(rawSum.toPrecision(2));
}
