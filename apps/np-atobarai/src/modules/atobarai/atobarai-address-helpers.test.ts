import { describe, expect, it } from "vitest";

import { AddressFragment, SourceObjectFragment } from "@/generated/graphql";

import {
  formatCustomerName,
  formatPhone,
  getEmailFromSourceObject,
} from "./atobarai-address-helpers";

describe("getEmailFromSourceObject", () => {
  it("should use Checkout email when sourceObject is Checkout", () => {
    const mockedCheckoutSourceObject = {
      __typename: "Checkout",
      id: "checkout-id",
      email: "checkout-user-email@com",
      channel: {
        id: "channel-id",
        slug: "default-channel",
        currencyCode: "JPY",
      },
      lines: [],
      shippingPrice: {
        gross: {
          amount: 0,
        },
      },
      totalPrice: {
        gross: {
          amount: 0,
        },
      },
    } satisfies SourceObjectFragment;
    const email = getEmailFromSourceObject(mockedCheckoutSourceObject);

    expect(email).toMatchInlineSnapshot(`"checkout-user-email@com"`);
  });

  it("should use Order userEmail when sourceObject is Order", () => {
    const mockedOrderSourceObject = {
      __typename: "Order",
      id: "order-id",
      userEmail: "user-order-email@example.com",
      channel: {
        id: "channel-id",
        slug: "default-channel",
        currencyCode: "JPY",
      },
      lines: [],
      shippingPrice: {
        gross: {
          amount: 0,
        },
      },
      total: {
        gross: {
          amount: 0,
        },
      },
    } satisfies SourceObjectFragment;
    const email = getEmailFromSourceObject(mockedOrderSourceObject);

    expect(email).toMatchInlineSnapshot(`"user-order-email@example.com"`);
  });
});

const addressFragment = {
  firstName: "FirstName",
  lastName: "LastName",
  companyName: "CompanyName",
  streetAddress1: "StreetAddress1",
  streetAddress2: "StreetAddress2",
  phone: "+81PhoneNumber",
  postalCode: "PostalCode",
  countryArea: "CountryArea",
  country: {
    code: "JP",
  },
  city: "Tokyo",
  cityArea: "Shibyua",
} satisfies AddressFragment;

describe("formatCustomerName", () => {
  it("should use firstName and lastName from address to create customer name with space", () => {
    const name = formatCustomerName(addressFragment);

    expect(name).toMatchInlineSnapshot(`"LastName FirstName"`);
  });
});

describe("formatPhone", () => {
  it("should convert phone number to one that starts with 0 (required by Atobarai)", () => {
    const tel = formatPhone(addressFragment.phone);

    expect(tel).toMatchInlineSnapshot(`"0PhoneNumber"`);
  });
});
