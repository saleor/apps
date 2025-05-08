import { StripeRefundsApi } from "./stripe-refunds-api";
import { StripeRestrictedKey } from "./stripe-restricted-key";
import { IStripeRefundsApi, IStripeRefundsApiFactory } from "./types";

export class StripeRefundsApiFactory implements IStripeRefundsApiFactory {
  create(args: { key: StripeRestrictedKey }): IStripeRefundsApi {
    return StripeRefundsApi.createFromKey({ key: args.key });
  }
}
