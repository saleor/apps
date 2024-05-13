import { CreateTransactionModel } from "avatax/lib/models/CreateTransactionModel";

export const extractTransactionArgsProperites = (model: CreateTransactionModel) => ({
  code: model.code,
  type: model.type,
  entityUseCode: model.entityUseCode,
  customerCode: model.customerCode,
  companyCode: model.companyCode,
  isAutocommit: model.commit,
  shipFromAddress: model.addresses?.shipFrom,
  shipToAddress: model.addresses?.shipTo,
  currencyCode: model.currencyCode,
  lines: model.lines.map((line) => ({
    amount: line.amount,
    taxCode: line.taxCode,
    quantity: line.quantity,
    itemCode: line.itemCode,
    description: line.description,
  })),
  date: model.date,
  isTaxIncluded: model.lines[0]?.taxIncluded ?? false,
});
