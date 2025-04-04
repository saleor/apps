import { err, ok } from "neverthrow";

import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export class StripeConfig {
  private constructor(
    private deps: {
      name: string;
      id: string;
      restrictedKey: StripeRestrictedKey;
      publishableKey: StripePublishableKey;
    },
  ) {}

  static createFromPersistedData(args: {
    configName: string;
    configId: string;
    restrictedKeyValue: string;
    publishableKeyValue: string;
  }) {
    const publishableKeyResult = StripePublishableKey.createFromPersistedData({
      publishableKeyValue: args.publishableKeyValue,
    });

    if (publishableKeyResult.isErr()) {
      return err(publishableKeyResult.error);
    }

    const restrictedKeyResult = StripeRestrictedKey.createFromPersistedData({
      restrictedKeyValue: args.restrictedKeyValue,
    });

    if (restrictedKeyResult.isErr()) {
      return err(restrictedKeyResult.error);
    }

    return ok(
      new StripeConfig({
        name: args.configName,
        id: args.configId,
        restrictedKey: restrictedKeyResult.value,
        publishableKey: publishableKeyResult.value,
      }),
    );
  }

  getConfigName() {
    return this.deps.name;
  }

  getConfigId() {
    return this.deps.id;
  }

  getRestrictedKey() {
    return this.deps.restrictedKey;
  }

  getPublishableKey() {
    return this.deps.publishableKey;
  }
}
