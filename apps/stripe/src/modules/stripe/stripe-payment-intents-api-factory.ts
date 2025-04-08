import { StripePaymentIntentsApi } from "./stripe-payment-intents-api";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripePaymentIntentsApi, IStripePaymentIntentsApiFactory } from "./types";

export class StripePaymentIntentsApiFactory implements IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi {
    return StripePaymentIntentsApi.createFromKey({ key: args.key });
  }
}
