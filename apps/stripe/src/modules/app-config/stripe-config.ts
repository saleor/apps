import { ok } from "neverthrow";

import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

export class StripeConfig {
  private constructor(
    private props: {
      name: string;
      id: string;
      restrictedKey: StripeRestrictedKey;
      publishableKey: StripePublishableKey;
    },
  ) {}

  static create(args: {
    configName: string;
    configId: string;
    restrictedKey: StripeRestrictedKey;
    publishableKey: StripePublishableKey;
  }) {
    // TODO: add validation of args: configName, configId
    return ok(
      new StripeConfig({
        name: args.configName,
        id: args.configId,
        restrictedKey: args.restrictedKey,
        publishableKey: args.publishableKey,
      }),
    );
  }

  getConfigName() {
    return this.props.name;
  }

  getConfigId() {
    return this.props.id;
  }

  getRestrictedKey() {
    return this.props.restrictedKey;
  }

  getPublishableKey() {
    return this.props.publishableKey;
  }
}
