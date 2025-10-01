import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";
import { PayPalRefundsApi } from "./paypal-refunds-api";
import { IPayPalRefundsApiFactory } from "./types";

export class PayPalRefundsApiFactory implements IPayPalRefundsApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }) {
    return PayPalRefundsApi.create(args);
  }
}
