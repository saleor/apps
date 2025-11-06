import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";
import { PayPalRefundsApi } from "./paypal-refunds-api";
import { IPayPalRefundsApiFactory } from "./types";

export class PayPalRefundsApiFactory implements IPayPalRefundsApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }) {
    return PayPalRefundsApi.create(args);
  }
}
