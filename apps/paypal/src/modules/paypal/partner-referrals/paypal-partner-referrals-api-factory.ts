import { PayPalClient } from "../paypal-client";
import { PayPalClientId } from "../paypal-client-id";
import { PayPalClientSecret } from "../paypal-client-secret";
import { PayPalEnv } from "../paypal-env";
import {
  IPayPalPartnerReferralsApi,
  PayPalPartnerReferralsApi,
} from "./paypal-partner-referrals-api";

/**
 * Factory interface for creating Partner Referrals API instances
 */
export interface IPayPalPartnerReferralsApiFactory {
  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): IPayPalPartnerReferralsApi;
}

/**
 * Factory for creating Partner Referrals API instances
 */
export class PayPalPartnerReferralsApiFactory implements IPayPalPartnerReferralsApiFactory {
  static create(): PayPalPartnerReferralsApiFactory {
    return new PayPalPartnerReferralsApiFactory();
  }

  create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    env: PayPalEnv;
  }): IPayPalPartnerReferralsApi {
    const client = PayPalClient.create({
      clientId: args.clientId,
      clientSecret: args.clientSecret,
      env: args.env,
    });

    return PayPalPartnerReferralsApi.create(client);
  }
}
