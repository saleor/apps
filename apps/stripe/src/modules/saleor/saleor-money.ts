import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";
import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class SaleorMoney {
  private readonly stripeAmount: number;
  private readonly stripeCurrency: string;

  static ValdationError = BaseError.subclass("ValidationError");

  private constructor(args: { stripeAmount: number; stripeCurrency: string }) {
    this.stripeAmount = args.stripeAmount;
    this.stripeCurrency = args.stripeCurrency;
  }

  static createFromStripe(args: { amount: number; currency: string }) {
    if (args.amount < 0) {
      return err(new SaleorMoney.ValdationError("Amount must be greater than 0"));
    }

    if (args.currency.length !== 3) {
      return err(new SaleorMoney.ValdationError("Currency code must be 3 characters long"));
    }

    if (currencyCodesData.code(args.currency) === undefined) {
      return err(new SaleorMoney.ValdationError("Currency code is not supported"));
    }

    return ok(
      new SaleorMoney({
        stripeAmount: args.amount,
        stripeCurrency: args.currency,
      }),
    );
  }

  getAmount() {
    const currencyCodeData = currencyCodesData.code(this.getCurrency());

    const amount = currencyJs(this.stripeAmount, {
      fromCents: true,
      // currencyCodeData will be defined at this point
      precision: currencyCodeData!.digits,
    });

    return amount.value;
  }

  getCurrency() {
    return this.stripeCurrency.toUpperCase();
  }
}
