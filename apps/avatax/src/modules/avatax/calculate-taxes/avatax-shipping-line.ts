import { createLogger } from "@saleor/apps-logger";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";

export const SHIPPING_ITEM_CODE = "Shipping";

const logger = createLogger("avataxShippingLine");

export const avataxShippingLine = {
  // * In AvaTax, shipping is a regular line
  create({
    amount,
    taxCode,
    taxIncluded,
  }: {
    amount: number;
    taxCode: string | undefined;
    taxIncluded: boolean;
  }): LineItemModel {
    return {
      amount,
      taxIncluded,
      taxCode,
      itemCode: SHIPPING_ITEM_CODE,
      quantity: 1,
    };
  },
  getFromTransactionModel(transactionModel: TransactionModel) {
    const shippingLine = transactionModel.lines?.find(
      (line) => line.itemCode === SHIPPING_ITEM_CODE,
    );

    if (!shippingLine) {
      logger.warn("Shipping line not found in the transaction model");
    }

    return shippingLine;
  },
};
