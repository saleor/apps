import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";
import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeMoney {
  private readonly amount: number;
  private readonly currency: string;

  static ValdationError = BaseError.subclass("ValidationError");

  private constructor(args: { amount: number; currency: string }) {
    this.amount = args.amount;
    this.currency = args.currency;
  }

  static createFromSaleorAmount(args: { amount: number; currency: string }) {
    if (args.amount < 0) {
      return err(new StripeMoney.ValdationError("Amount must be greater than 0"));
    }

    if (args.currency.length !== 3) {
      return err(new StripeMoney.ValdationError("Currency code must be 3 characters long"));
    }

    if (currencyCodesData.code(args.currency) === undefined) {
      return err(new StripeMoney.ValdationError("Currency code is not supported"));
    }

    return ok(
      new StripeMoney({
        amount: args.amount,
        currency: args.currency,
      }),
    );
  }

  getAmount() {
    const currencyCodeData = currencyCodesData.code(this.currency);

    const amount = currencyJs(this.amount, {
      // currencyCodeData will be defined at this point
      precision: currencyCodeData!.digits,
    });

    return amount.intValue;
  }

  getCurrency() {
    return this.currency.toLowerCase();
  }
}
