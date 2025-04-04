import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripePublishableKey {
  static WrongKeyFormatError = BaseError.subclass("WrongKeyFormatError");
  private static testPrefix = "pk_test_";
  private static livePrefix = "pk_live_";

  private constructor(private key: string) {}

  private static isInProperFormat(key: string) {
    return (
      key.startsWith(StripePublishableKey.testPrefix) ||
      key.startsWith(StripePublishableKey.livePrefix)
    );
  }

  static createFromUserInput(args: { publishableKey: string }) {
    if (StripePublishableKey.isInProperFormat(args.publishableKey)) {
      return ok(new StripePublishableKey(args.publishableKey));
    }

    return err(
      new this.WrongKeyFormatError(
        "Invalid publishable key format - it should start with `pk_test_` or `pk_live_`",
      ),
    );
  }

  static createFromPersistedData(args: { publishableKeyValue: string }) {
    if (StripePublishableKey.isInProperFormat(args.publishableKeyValue)) {
      return ok(new StripePublishableKey(args.publishableKeyValue));
    }

    return err(
      new this.WrongKeyFormatError(
        "Invalid publishable key format - it should start with `pk_test_` or `pk_live_`",
      ),
    );
  }

  getKeyValue() {
    return this.key;
  }
}
