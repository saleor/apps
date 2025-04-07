import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeRestrictedKey {
  readonly keyValue: string;

  static ValidationError = BaseError.subclass("ValidationError");

  private static testPrefix = "rk_test_";
  private static livePrefix = "rk_live_";

  private constructor(keyValue: string) {
    this.keyValue = keyValue;
  }

  private static isInProperFormat(keyValue: string) {
    return (
      keyValue.startsWith(StripeRestrictedKey.testPrefix) ||
      keyValue.startsWith(StripeRestrictedKey.livePrefix)
    );
  }

  static create(args: { restrictedKey: string }) {
    if (args.restrictedKey.length === 0) {
      return err(new this.ValidationError("Restricted key cannot be empty"));
    }

    if (!this.isInProperFormat(args.restrictedKey)) {
      return err(
        new this.ValidationError(
          "Invalid restricted key format - it should start with `rk_test_` or `rk_live_`",
        ),
      );
    }

    return ok(new StripeRestrictedKey(args.restrictedKey));
  }
}
