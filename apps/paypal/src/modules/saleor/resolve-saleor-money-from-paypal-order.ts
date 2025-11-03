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

  // For captured/authorized orders, get amount from the payment details
  let amountValue: string;
  let currencyCode: string;

  if (purchaseUnit.payments?.captures?.[0]) {
    // Captured order
    amountValue = purchaseUnit.payments.captures[0].amount.value;
    currencyCode = purchaseUnit.payments.captures[0].amount.currency_code;
  } else if (purchaseUnit.payments?.authorizations?.[0]) {
    // Authorized order
    amountValue = purchaseUnit.payments.authorizations[0].amount.value;
    currencyCode = purchaseUnit.payments.authorizations[0].amount.currency_code;
  } else if (purchaseUnit.amount) {
    // Created/pending order
    amountValue = purchaseUnit.amount.value;
    currencyCode = purchaseUnit.amount.currency_code;
  } else {
    return err(new ResolveSaleorMoneyError("No amount found in PayPal order"));
  }

  const amount = parseFloat(amountValue);
  const currency = currencyCode;

  return ok(createSaleorMoney({ amount, currency }));
};
