import { describe, expect, it } from "vitest";

import {
  type StripeCustomerAddressFragment,
  type StripeCustomerSourceFragment,
} from "@/generated/graphql";

import { resolveStripeCustomerDetails } from "./stripe-customer-details";

const address = (overrides: Partial<StripeCustomerAddressFragment> = {}) =>
  ({
    firstName: "Ada",
    lastName: "Lovelace",
    companyName: "",
    streetAddress1: "1 Main St",
    streetAddress2: "",
    city: "London",
    postalCode: "N1 9GU",
    country: { code: "GB" },
    countryArea: "",
    phone: "+441234567890",
    ...overrides,
  }) satisfies StripeCustomerAddressFragment;

const checkout = (
  overrides: Partial<Extract<StripeCustomerSourceFragment, { __typename: "Checkout" }>> = {},
): StripeCustomerSourceFragment => ({
  __typename: "Checkout",
  email: "buyer@example.com",
  user: null,
  billingAddress: address(),
  shippingAddress: address({ firstName: "Grace", lastName: "Hopper", phone: "+15550001111" }),
  ...overrides,
});

describe("resolveStripeCustomerDetails", () => {
  it("Maps checkout buyer data to Customer and Payment Intent shipping", () => {
    expect(resolveStripeCustomerDetails(checkout())).toStrictEqual({
      customer: {
        email: "buyer@example.com",
        name: "Ada Lovelace",
        phone: "+441234567890",
        address: {
          line1: "1 Main St",
          line2: undefined,
          city: "London",
          postal_code: "N1 9GU",
          state: undefined,
          country: "GB",
        },
        shipping: {
          name: "Grace Hopper",
          phone: "+15550001111",
          address: {
            line1: "1 Main St",
            line2: undefined,
            city: "London",
            postal_code: "N1 9GU",
            state: undefined,
            country: "GB",
          },
        },
      },
      paymentShipping: {
        name: "Grace Hopper",
        phone: "+15550001111",
        address: {
          line1: "1 Main St",
          line2: undefined,
          city: "London",
          postal_code: "N1 9GU",
          state: undefined,
          country: "GB",
        },
      },
    });
  });

  it("Uses order userEmail", () => {
    const result = resolveStripeCustomerDetails({
      __typename: "Order",
      userEmail: "order-buyer@example.com",
      user: null,
      billingAddress: null,
      shippingAddress: null,
    });

    expect(result.customer.email).toBe("order-buyer@example.com");
  });

  it("Falls back to the user's email when the checkout has none", () => {
    const result = resolveStripeCustomerDetails(
      checkout({
        email: null,
        user: { id: "user-1", email: "account@example.com", firstName: "", lastName: "" },
      }),
    );

    expect(result.customer.email).toBe("account@example.com");
  });

  it.each([
    {
      case: "billing address",
      source: checkout(),
      expected: "Ada Lovelace",
    },
    {
      case: "user when billing address has no name",
      source: checkout({
        billingAddress: address({ firstName: "", lastName: "" }),
        user: { id: "user-1", email: "a@example.com", firstName: "Alan", lastName: "Turing" },
      }),
      expected: "Alan Turing",
    },
    {
      case: "shipping address when nothing else has a name",
      source: checkout({ billingAddress: null }),
      expected: "Grace Hopper",
    },
    {
      case: "nothing",
      source: checkout({ billingAddress: null, shippingAddress: null }),
      expected: undefined,
    },
  ])("Takes the name from $case", ({ source, expected }) => {
    expect(resolveStripeCustomerDetails(source).customer.name).toBe(expected);
  });

  it("Leaves shipping out when there is no shipping address", () => {
    const result = resolveStripeCustomerDetails(checkout({ shippingAddress: null }));

    expect(result.customer.shipping).toBeUndefined();
    expect(result.paymentShipping).toBeUndefined();
  });

  it("Uses the buyer's name for shipping when the shipping address has none", () => {
    const result = resolveStripeCustomerDetails(
      checkout({ shippingAddress: address({ firstName: "", lastName: "" }) }),
    );

    expect(result.paymentShipping?.name).toBe("Ada Lovelace");
  });
});
