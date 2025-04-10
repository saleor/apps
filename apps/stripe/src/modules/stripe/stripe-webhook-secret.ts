import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class StripeWebhookSecret {
  readonly secretValue: string;

  static ValidationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "StripeWebhookSecret.ValidationError" as const,
    },
  });

  private static prefix = "whsec_";

  private constructor(keyValue: string) {
    this.secretValue = keyValue;
  }

  private static isInProperFormat(keyValue: string): boolean {
    return keyValue.startsWith(StripeWebhookSecret.prefix);
  }

  static create(
    secretValue: string,
  ): Result<StripeWebhookSecret, InstanceType<typeof StripeWebhookSecret.ValidationError>> {
    if (secretValue.length === 0) {
      return err(new this.ValidationError("Webhook Secret can not be empty"));
    }

    if (!this.isInProperFormat(secretValue)) {
      return err(
        new this.ValidationError(`Invalid format - must start with ${StripeWebhookSecret.prefix}`),
      );
    }

    return ok(new StripeWebhookSecret(secretValue));
  }
}
