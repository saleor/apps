import { e2e } from "pactum";
import { string } from "pactum-matchers";
import { describe, it } from "vitest";

import {
  CheckoutAddBilling,
  CompleteCheckout,
  CreateCheckoutNoAddress,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/money";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=16239
describe("App should calculate taxes for checkout with digital products only TC: AVATAX_8", () => {
  const testCase = e2e("Digitak checkout [pricesEnteredWithTax: False]");

  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE = 54.44;
  const TOTAL_NET_PRICE = 50;
  const TOTAL_TAX_PRICE = 4.44;

  const addressVerification = {
    city: "$M{Address.NewYork.city}",
    streetAddress1: "$M{Address.NewYork.streetAddress1}",
    postalCode: "$M{Address.NewYork.postalCode}",
  };

  it("should crate checkout for digital product", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckoutNoAddress)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
        "@OVERRIDES@": {
          lines: [{ quantity: 1, variantId: "$M{Product.DigitalProduct.variantId}" }],
        },
      })
      .expectStatus(200)
      .expectJson(
        "data.checkoutCreate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_NET_PRICE,
          net: TOTAL_NET_PRICE,
          tax: 0,
          currency: CURRENCY,
        }),
      )
      .retry()
      .stores("CheckoutId", "data.checkoutCreate.checkout.id");
  });

  it("should add a valid billing address", async () => {
    await testCase
      .step("Add billing address")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutAddBilling)
      .withGraphQLVariables({
        id: "$S{CheckoutId}",
        billingAddress: "$M{Address.NewYork}",
      })
      .expectStatus(200)
      .expectJsonLike(
        "data.checkoutBillingAddressUpdate.checkout.billingAddress",
        addressVerification,
      )
      .expectJson(
        "data.checkoutBillingAddressUpdate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE,
          net: TOTAL_NET_PRICE,
          tax: TOTAL_TAX_PRICE,
          currency: CURRENCY,
        }),
      );
  });

  it("checkout should be able to complete", async () => {
    await testCase
      .step("Complete checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CompleteCheckout)
      .withGraphQLVariables({ checkoutId: "$S{CheckoutId}" })
      .expectJsonMatch({
        data: {
          checkoutComplete: {
            order: {
              id: string(),
            },
          },
        },
      });
  });
});
