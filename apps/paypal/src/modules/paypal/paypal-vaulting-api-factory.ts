import { PayPalVaultingApi } from "./paypal-vaulting-api";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";

/**
 * Factory for creating PayPalVaultingApi instances
 */
export class PayPalVaultingApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): PayPalVaultingApi {
    return PayPalVaultingApi.create(args);
  }
}
