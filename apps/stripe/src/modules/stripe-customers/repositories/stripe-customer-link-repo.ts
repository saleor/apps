import { type Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { type StripeCustomerId } from "@/modules/stripe/stripe-customer-id";

/**
 * A Customer belongs to one Stripe account and mode, which is what a Stripe config points to.
 */
export type StripeCustomerLinkAccess = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
  configId: string;
  saleorUserId: string;
};

export const StripeCustomerLinkRepoError = BaseError.subclass("StripeCustomerLinkRepoError", {
  props: {
    _internalName: "StripeCustomerLinkRepoError" as const,
  },
});

export type StripeCustomerLinkRepoError = InstanceType<typeof StripeCustomerLinkRepoError>;

/**
 * Links a signed-in Saleor user to their Stripe Customer, so later payments reuse it.
 */
export interface StripeCustomerLinkRepo {
  getCustomerId(
    access: StripeCustomerLinkAccess,
  ): Promise<Result<StripeCustomerId | null, StripeCustomerLinkRepoError>>;

  /**
   * Keeps the first link written. Returns the Customer ID that is linked after the call, which is
   * an existing one if another payment linked the user first.
   */
  saveCustomerId(
    access: StripeCustomerLinkAccess,
    customerId: StripeCustomerId,
  ): Promise<Result<StripeCustomerId, StripeCustomerLinkRepoError>>;

  deleteCustomerId(
    access: StripeCustomerLinkAccess,
  ): Promise<Result<null, StripeCustomerLinkRepoError>>;
}
