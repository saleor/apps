import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripePublishableKey {
  readonly keyValue: string;

  static ValidationError = BaseError.subclass("ValidationError");

  private static testPrefix = "pk_test_";
  private static livePrefix = "pk_live_";

  private constructor(keyValue: string) {
    this.keyValue = keyValue;
  }

  private static isInProperFormat(keyValue: string) {
    return (
      keyValue.startsWith(StripePublishableKey.testPrefix) ||
      keyValue.startsWith(StripePublishableKey.livePrefix)
    );
  }

  static create(args: { publishableKey: string }) {
    if (args.publishableKey.length === 0) {
      return err(new this.ValidationError("Publishable key cannot be empty"));
    }

    if (!this.isInProperFormat(args.publishableKey)) {
      return err(
        new this.ValidationError(
          "Invalid restricted key format - it should start with `pk_test_` or `pk_live_`",
        ),
      );
    }

    return ok(new StripePublishableKey(args.publishableKey));
  }
}
