import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { PayPalClientId } from "@/modules/paypal/paypal-client-id";
import { PayPalClientSecret } from "@/modules/paypal/paypal-client-secret";
import { PayPalEnv } from "@/modules/paypal/paypal-env";

export class PayPalConfig {
  readonly name: string;
  readonly id: string;
  readonly clientId: PayPalClientId;
  readonly clientSecret: PayPalClientSecret;
  readonly environment: PayPalEnv;

  static ValidationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "PayPalConfig.ValidationError" as const,
    },
  });

  private constructor(props: {
    name: string;
    id: string;
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    environment: PayPalEnv;
  }) {
    this.name = props.name;
    this.id = props.id;
    this.clientId = props.clientId;
    this.clientSecret = props.clientSecret;
    this.environment = props.environment;
  }

  getPayPalEnvValue(): PayPalEnv {
    return this.environment;
  }

  static create(args: {
    name: string;
    id: string;
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    environment: PayPalEnv;
  }): Result<PayPalConfig, InstanceType<typeof PayPalConfig.ValidationError>> {
    if (args.name.length === 0) {
      return err(new PayPalConfig.ValidationError("Config name cannot be empty"));
    }

    if (args.id.length === 0) {
      return err(new PayPalConfig.ValidationError("Config id cannot be empty"));
    }

    if (args.environment !== "SANDBOX" && args.environment !== "LIVE") {
      return err(
        new PayPalConfig.ValidationError("Environment must be either SANDBOX or LIVE"),
      );
    }

    return ok(
      new PayPalConfig({
        name: args.name,
        id: args.id,
        clientId: args.clientId,
        clientSecret: args.clientSecret,
        environment: args.environment,
      }),
    );
  }
}

export type PayPalFrontendConfigSerializedFields = {
  readonly name: string;
  readonly id: string;
  readonly clientId: string;
  readonly environment: PayPalEnv;
};

/**
 * Safe class that only returns what's permitted to the UI.
 * It also allows to serialize and deserialize itself, so it can be easily transported via tRPC
 */
export class PayPalFrontendConfig implements PayPalFrontendConfigSerializedFields {
  readonly name: string;
  readonly id: string;
  readonly clientId: string;
  readonly environment: PayPalEnv;

  private constructor(fields: PayPalFrontendConfigSerializedFields) {
    this.name = fields.name;
    this.id = fields.id;
    this.clientId = fields.clientId;
    this.environment = fields.environment;
  }

  private static getMaskedSecretValue(secret: PayPalClientSecret) {
    return `...${secret.slice(-4)}`;
  }

  getPayPalEnvValue() {
    return this.environment;
  }

  static createFromPayPalConfig(paypalConfig: PayPalConfig) {
    return new PayPalFrontendConfig({
      name: paypalConfig.name,
      id: paypalConfig.id,
      clientId: paypalConfig.clientId,
      environment: paypalConfig.environment,
    });
  }

  static createFromSerializedFields(fields: PayPalFrontendConfigSerializedFields) {
    return new PayPalFrontendConfig(fields);
  }
}
