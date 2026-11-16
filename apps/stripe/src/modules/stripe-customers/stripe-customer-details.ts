import type Stripe from "stripe";

import {
  type StripeCustomerAddressFragment,
  type StripeCustomerSourceFragment,
} from "@/generated/graphql";

/**
 * Saleor returns empty strings for address fields that were never set. Sending them would store
 * empty values in Stripe instead of leaving the fields out.
 */
const nonEmpty = (value: string | null | undefined) => value?.trim() || undefined;

const fullName = (person: { firstName: string; lastName: string } | null | undefined) =>
  nonEmpty(`${person?.firstName ?? ""} ${person?.lastName ?? ""}`);

const toStripeAddress = (address: StripeCustomerAddressFragment): Stripe.AddressParam => ({
  line1: nonEmpty(address.streetAddress1),
  line2: nonEmpty(address.streetAddress2),
  city: nonEmpty(address.city),
  postal_code: nonEmpty(address.postalCode),
  state: nonEmpty(address.countryArea),
  country: nonEmpty(address.country.code),
});

export type StripeCustomerDetails = {
  customer: Pick<Stripe.CustomerCreateParams, "email" | "name" | "phone" | "address" | "shipping">;
  /** Where this payment ships. Set on the Payment Intent, the Customer keeps its first address. */
  paymentShipping: Stripe.PaymentIntentCreateParams.Shipping | undefined;
};

/**
 * Maps the buyer data Saleor sends with the checkout or order to Stripe Customer fields.
 */
export const resolveStripeCustomerDetails = (
  source: StripeCustomerSourceFragment,
): StripeCustomerDetails => {
  const email = source.__typename === "Order" ? source.userEmail : source.email;
  const { user, billingAddress, shippingAddress } = source;

  const name = fullName(billingAddress) ?? fullName(user) ?? fullName(shippingAddress);

  const shippingName = fullName(shippingAddress) ?? name;
  const shipping =
    shippingAddress && shippingName
      ? {
          name: shippingName,
          phone: nonEmpty(shippingAddress.phone),
          address: toStripeAddress(shippingAddress),
        }
      : undefined;

  return {
    customer: {
      email: nonEmpty(email) ?? nonEmpty(user?.email),
      name,
      phone: nonEmpty(billingAddress?.phone) ?? nonEmpty(shippingAddress?.phone),
      address: billingAddress ? toStripeAddress(billingAddress) : undefined,
      shipping,
    },
    paymentShipping: shipping,
  };
};
