import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";
import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeMoney {
  private readonly saleorAmount: number;
  private readonly saleorCurrency: string;

  static ValdationError = BaseError.subclass("ValidationError");

  private constructor(args: { saleorAmount: number; saleorCurrency: string }) {
    this.saleorAmount = args.saleorAmount;
    this.saleorCurrency = args.saleorCurrency;
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
        saleorAmount: args.amount,
        saleorCurrency: args.currency,
      }),
    );
  }

  getAmount() {
    const currencyCodeData = currencyCodesData.code(this.saleorCurrency);

    const amount = currencyJs(this.saleorAmount, {
      // currencyCodeData will be defined at this point
      precision: currencyCodeData!.digits,
    });

    return amount.intValue;
  }

  getCurrency() {
    return this.saleorCurrency.toLowerCase();
  }
}
