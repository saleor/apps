import { TRPCError } from "@trpc/server";

import { type StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { type IStripeCustomersApiFactory } from "@/modules/stripe/types";

/**
 * Customer creation needs a scope that restricted keys created before this feature don't have.
 * PRECONDITION_FAILED lets the UI switch the toggle back off.
 */
export const assertCanCreateStripeCustomersOrThrow = async ({
  customersApiFactory,
  restrictedKey,
}: {
  customersApiFactory: IStripeCustomersApiFactory;
  restrictedKey: StripeRestrictedKey;
}) => {
  const permission = await customersApiFactory
    .create({ key: restrictedKey })
    .hasCustomersWritePermission();

  if (permission.isErr()) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Couldn't check the restricted key's permissions in Stripe. Please try again or contact support.",
    });
  }

  if (!permission.value) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        'The restricted key is missing the "Customers - Write" permission. Add it to the key in Stripe Dashboard → Developers → API keys, then turn customer creation on again.',
    });
  }
};
