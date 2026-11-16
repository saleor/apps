import { StripeCustomersApi } from "./stripe-customers-api";
import { type StripeRestrictedKey } from "./stripe-restricted-key";
import { type IStripeCustomersApi, type IStripeCustomersApiFactory } from "./types";

export class StripeCustomersApiFactory implements IStripeCustomersApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripeCustomersApi {
    return StripeCustomersApi.createFromKey({ key: args.key });
  }
}
