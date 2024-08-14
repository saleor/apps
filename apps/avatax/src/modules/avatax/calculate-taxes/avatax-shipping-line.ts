import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TransactionModel } from "avatax/lib/models/TransactionModel";

import { createLogger } from "../../../logger";

export const SHIPPING_ITEM_CODE = "Shipping";

const logger = createLogger("avataxShippingLine");

export const avataxShippingLine = {
  // * In AvaTax, shipping is a regular line
  create({
    amount,
    taxCode,
    taxIncluded,
    discounted,
  }: {
    amount: number;
    taxCode: string | undefined;
    taxIncluded: boolean;
    discounted?: boolean;
  }): LineItemModel {
    return {
      amount,
      taxIncluded,
      taxCode,
      itemCode: SHIPPING_ITEM_CODE,
      quantity: 1,
      discounted,
    };
  },
  getFromAvaTaxTransactionModel(transactionModel: TransactionModel) {
    const shippingLine = transactionModel.lines?.find(
      (line) => line.itemCode === SHIPPING_ITEM_CODE,
    );

    if (!shippingLine) {
      logger.debug("Shipping line not found in the transaction model");
    }

    return shippingLine;
  },
};
