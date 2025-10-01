import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { PayPalOrder } from "@/modules/paypal/types";

import { createSaleorMoney, SaleorMoney } from "./saleor-money";

const ResolveSaleorMoneyError = BaseError.subclass("ResolveSaleorMoneyError");

export const resolveSaleorMoneyFromPayPalOrder = (
  order: PayPalOrder,
): Result<SaleorMoney, InstanceType<typeof ResolveSaleorMoneyError>> => {
  const purchaseUnit = order.purchase_units[0];

  if (!purchaseUnit) {
    return err(new ResolveSaleorMoneyError("No purchase unit found in PayPal order"));
  }

  const amount = parseFloat(purchaseUnit.amount.value);
  const currency = purchaseUnit.amount.currency_code;

  return ok(createSaleorMoney({ amount, currency }));
};
