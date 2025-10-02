import { Result, ok, err } from "neverthrow";
import { z } from "zod";

import { PayPalEnv } from "@/modules/paypal/paypal-env";
import { createPayPalClientId, PayPalClientId } from "@/modules/paypal/paypal-client-id";
import { createPayPalClientSecret, PayPalClientSecret } from "@/modules/paypal/paypal-client-secret";

const paypalConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  environment: z.enum(["SANDBOX", "LIVE"]),
});

export class PayPalConfig {
  public readonly id: string;
  public readonly name: string;
  public readonly clientId: PayPalClientId;
  public readonly clientSecret: PayPalClientSecret;
  public readonly environment: PayPalEnv;

  constructor(
    id: string,
    name: string,
    clientId: PayPalClientId,
    clientSecret: PayPalClientSecret,
    environment: PayPalEnv,
  ) {
    this.id = id;
    this.name = name;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.environment = environment;
  }

  static create(input: {
    id: string;
    name: string;
    clientId: string;
    clientSecret: string;
    environment: PayPalEnv;
  }): Result<PayPalConfig, Error> {
    const validation = paypalConfigSchema.safeParse(input);
    
    if (!validation.success) {
      return err(new Error(`Invalid PayPal config: ${validation.error.message}`));
    }

    try {
      const clientId = createPayPalClientId(input.clientId);
      const clientSecret = createPayPalClientSecret(input.clientSecret);

      return ok(new PayPalConfig(
        input.id,
        input.name,
        clientId,
        clientSecret,
        input.environment,
      ));
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to create PayPal config'));
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      environment: this.environment,
    };
  }
}