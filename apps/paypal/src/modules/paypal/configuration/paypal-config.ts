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
  merchantClientId: z.string().optional(),
  merchantEmail: z.string().optional(),
  merchantId: z.string().optional(),
});

export class PayPalConfig {
  public readonly id: string;
  public readonly name: string;
  public readonly clientId: PayPalClientId;
  public readonly clientSecret: PayPalClientSecret;
  public readonly environment: PayPalEnv;
  public readonly merchantClientId?: string;
  public readonly merchantEmail?: string;
  public readonly merchantId?: string;

  constructor(
    id: string,
    name: string,
    clientId: PayPalClientId,
    clientSecret: PayPalClientSecret,
    environment: PayPalEnv,
    merchantClientId?: string,
    merchantEmail?: string,
    merchantId?: string,
  ) {
    this.id = id;
    this.name = name;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.environment = environment;
    this.merchantClientId = merchantClientId;
    this.merchantEmail = merchantEmail;
    this.merchantId = merchantId;
  }

  static create(input: {
    id: string;
    name: string;
    clientId: string;
    clientSecret: string;
    environment: PayPalEnv;
    merchantClientId?: string;
    merchantEmail?: string;
    merchantId?: string;
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
        input.merchantClientId,
        input.merchantEmail,
        input.merchantId,
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
      merchantClientId: this.merchantClientId,
      merchantEmail: this.merchantEmail,
      merchantId: this.merchantId,
    };
  }
}