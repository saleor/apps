import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalEnv } from "./paypal-env";
import { PayPalOrdersApi } from "./paypal-orders-api";
import { IPayPalOrdersApiFactory } from "./types";

export class PayPalOrdersApiFactory implements IPayPalOrdersApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }) {
    return PayPalOrdersApi.create(args);
  }
}
