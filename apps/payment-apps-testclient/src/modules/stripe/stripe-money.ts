import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";

import { BaseError } from "@/lib/errors";

export class StripeMoney {
  public readonly amount: number;
  public readonly currency: string;

  static ValidationError = BaseError.subclass("ValidationError");

  private constructor(args: { amount: number; currency: string }) {
    this.amount = args.amount;
    this.currency = args.currency;
  }

  static createFromSaleorAmount(args: { amount: number; currency: string }) {
    if (args.amount < 0) {
      throw new StripeMoney.ValidationError("Amount must be greater than 0");
    }

    if (args.currency.length !== 3) {
      throw new StripeMoney.ValidationError("Currency code must be 3 characters long");
    }

    const currencyCodeData = currencyCodesData.code(args.currency);

    if (currencyCodeData === undefined) {
      throw new StripeMoney.ValidationError("Currency code is not supported");
    }

    const convertedAmount = currencyJs(args.amount, {
      precision: currencyCodeData.digits,
    });

    return new StripeMoney({
      amount: convertedAmount.intValue,
      currency: args.currency.toLowerCase(),
    });
  }
}
