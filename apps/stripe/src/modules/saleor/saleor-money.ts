import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class SaleorMoney {
  public readonly amount: number;
  public readonly currency: string;

  static ValidationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "SaleorMoney.ValidationError" as const,
    },
  });

  private constructor(args: { amount: number; currency: string }) {
    this.amount = args.amount;
    this.currency = args.currency;
  }

  static createFromStripe(args: {
    amount: number;
    currency: string;
  }): Result<SaleorMoney, InstanceType<typeof SaleorMoney.ValidationError>> {
    if (args.amount < 0) {
      return err(new SaleorMoney.ValidationError("Amount must be greater than 0"));
    }

    if (args.currency.length !== 3) {
      return err(new SaleorMoney.ValidationError("Currency code must be 3 characters long"));
    }

    const currencyCodeData = currencyCodesData.code(args.currency);

    if (currencyCodeData === undefined) {
      return err(new SaleorMoney.ValidationError("Currency code is not supported"));
    }

    const convertedAmount = currencyJs(args.amount, {
      fromCents: true,
      precision: currencyCodeData.digits,
    });

    return ok(
      new SaleorMoney({
        amount: convertedAmount.value,
        currency: args.currency.toUpperCase(),
      }),
    );
  }
}
