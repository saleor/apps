import { ok, err, Result } from "neverthrow";
import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";

export class PayPalAuthValidator {
  static async validateCredentials(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): Promise<Result<boolean, Error>> {
    try {
      const client = PayPalClient.create(args);
      
      // Try to make a simple request to validate credentials
      await client.makeRequest({
        method: "GET",
        path: "/v1/identity/oauth2/userinfo?schema=paypalv1.1",
      });
      
      return ok(true);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Invalid PayPal credentials"));
    }
  }
}