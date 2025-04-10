import { default as currencyJs } from "currency.js";
import { default as currencyCodesData } from "currency-codes";
import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeMoney {
  public readonly amount: number;
  public readonly currency: string;

  static ValdationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "StripeMoney.ValidationError" as const,
    },
  });

  private constructor(args: { amount: number; currency: string }) {
    this.amount = args.amount;
    this.currency = args.currency;
  }

  static createFromSaleorAmount(args: {
    amount: number;
    currency: string;
  }): Result<StripeMoney, InstanceType<typeof StripeMoney.ValdationError>> {
    if (args.amount < 0) {
      return err(new StripeMoney.ValdationError("Amount must be greater than 0"));
    }

    if (args.currency.length !== 3) {
      return err(new StripeMoney.ValdationError("Currency code must be 3 characters long"));
    }

    const currencyCodeData = currencyCodesData.code(args.currency);

    if (currencyCodeData === undefined) {
      return err(new StripeMoney.ValdationError("Currency code is not supported"));
    }
    const convertedAmount = currencyJs(args.amount, {
      precision: currencyCodeData.digits,
    });

    return ok(
      new StripeMoney({
        amount: convertedAmount.intValue,
        currency: args.currency.toLowerCase(),
      }),
    );
  }
}
