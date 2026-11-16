import { describe, expect, it } from "vitest";

import { createSquareStoreCardVerificationDetails } from "./store-card-verification-details";

describe("createSquareStoreCardVerificationDetails", () => {
  it("maps Saleor checkout contact data to Square's STORE contract", () => {
    expect(
      createSquareStoreCardVerificationDetails({
        email: "shopper@example.com",
        billingAddress: {
          firstName: "Ada",
          lastName: "Lovelace",
          streetAddress1: "12 St James's Square",
          streetAddress2: "Suite 3",
          city: "London",
          countryArea: "London",
          country: { code: "GB" },
          postalCode: "SW1Y 4LB",
          phone: "+44 20 7946 0958",
        },
      }),
    ).toStrictEqual({
      intent: "STORE",
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: {
        givenName: "Ada",
        familyName: "Lovelace",
        email: "shopper@example.com",
        phone: "+44 20 7946 0958",
        addressLines: ["12 St James's Square", "Suite 3"],
        city: "London",
        state: "London",
        countryCode: "GB",
        postalCode: "SW1Y 4LB",
      },
    });
  });

  it("omits blank optional checkout fields", () => {
    expect(
      createSquareStoreCardVerificationDetails({
        email: " shopper@example.com ",
        billingAddress: {
          streetAddress1: " ",
          streetAddress2: null,
        },
      }),
    ).toStrictEqual({
      intent: "STORE",
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: {
        givenName: undefined,
        familyName: undefined,
        email: "shopper@example.com",
        phone: undefined,
        addressLines: undefined,
        city: undefined,
        state: undefined,
        countryCode: undefined,
        postalCode: undefined,
      },
    });
  });
});
