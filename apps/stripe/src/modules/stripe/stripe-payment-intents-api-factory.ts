import { StripePaymentIntentsApi } from "./stripe-payment-intents-api";
import { type StripeRestrictedKey } from "./stripe-restricted-key";
import { type IStripePaymentIntentsApi, type IStripePaymentIntentsApiFactory } from "./types";

export class StripePaymentIntentsApiFactory implements IStripePaymentIntentsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripePaymentIntentsApi {
    return StripePaymentIntentsApi.createFromKey({ key: args.key });
  }
}
