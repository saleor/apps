import Decimal from "decimal.js-light";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

/**
 * Represents a price in the Saleor system (amount is represented as float).
 */
export class SaleorPrice {
  static ArgsParseError = BaseError.subclass("ArgsParseError");

  private static ArgsSchema = z.object({
    floatAmount: z.number(),
    currency: z.string(),
  });

  private constructor(
    private amount: Decimal,
    private currency: string,
  ) {}

  getCurrency(): string {
    return this.currency;
  }

  static create(args: z.infer<typeof SaleorPrice.ArgsSchema>) {
    const parsedArgs = SaleorPrice.ArgsSchema.safeParse(args);

    if (parsedArgs.success === false) {
      throw new SaleorPrice.ArgsParseError("Invalid arguments", {
        cause: parsedArgs.error,
      });
    }

    return new SaleorPrice(new Decimal(parsedArgs.data.floatAmount), parsedArgs.data.currency);
  }

  toAdyenPrice(): AdyenPrice {
    return AdyenPrice.create({
      currency: this.currency,
      integerAmount: this.amount.times(100).toNumber(),
    });
  }

  getAmount(): number {
    return this.amount.toNumber();
  }
}

/**
 * Represents a price in the Adyen system (amount is represented as integer).
 */
export class AdyenPrice {
  static ArgsParseError = BaseError.subclass("ArgsParseError");

  private static ArgsSchema = z.object({
    integerAmount: z.number().int(),
    currency: z.string(),
  });

  private constructor(
    private amount: Decimal,
    private currency: string,
  ) {}

  static create(args: z.infer<typeof AdyenPrice.ArgsSchema>) {
    const parsedArgs = AdyenPrice.ArgsSchema.safeParse(args);

    if (parsedArgs.success === false) {
      throw new AdyenPrice.ArgsParseError("Invalid arguments", {
        cause: parsedArgs.error,
      });
    }

    return new AdyenPrice(new Decimal(parsedArgs.data.integerAmount), parsedArgs.data.currency);
  }

  toSaleorPrice(): SaleorPrice {
    return SaleorPrice.create({
      currency: this.currency,
      floatAmount: this.amount.dividedBy(100).toNumber(),
    });
  }

  getAmount(): number {
    return this.amount.toNumber();
  }

  getCurrency(): string {
    return this.currency;
  }
}
