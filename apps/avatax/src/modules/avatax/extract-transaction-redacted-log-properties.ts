import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";

export const extractTransactionRedactedLogProperties = (model: CreateTransactionModel) => ({
  code: model.code,
  type: model.type,
  entityUseCode: model.entityUseCode,
  customerCode: model.customerCode,
  companyCode: model.companyCode,
  isAutocommit: model.commit,
  currencyCode: model.currencyCode,
  linesCount: model.lines.length,
  date: model.date.toISOString(),
  isTaxIncluded: model.lines[0]?.taxIncluded ?? false,
  discountAmount: model.discount,
});
