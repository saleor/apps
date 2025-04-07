import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeRestrictedKey {
  static WrongKeyFormatError = BaseError.subclass("WrongKeyFormatError");
  private static testPrefix = "rk_test_";
  private static livePrefix = "rk_live_";

  private constructor(private key: string) {}

  private static isInProperFormat(key: string) {
    return (
      key.startsWith(StripeRestrictedKey.testPrefix) ||
      key.startsWith(StripeRestrictedKey.livePrefix)
    );
  }

  static create(args: { restrictedKey: string }) {
    if (StripeRestrictedKey.isInProperFormat(args.restrictedKey)) {
      return ok(new StripeRestrictedKey(args.restrictedKey));
    }

    return err(
      new this.WrongKeyFormatError(
        "Invalid restricted key format - it should start with `rk_test_` or `rk_live_`",
      ),
    );
  }

  getKeyValue() {
    return this.key;
  }
}
