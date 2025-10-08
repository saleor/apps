import { e2e } from "pactum";
import { describe, it } from "vitest";

import {
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
  UpdatePrivateMetadata,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/money";

// Test for shipFrom address private metadata override functionality
describe("App should use shipFrom address from private metadata TC: AVATAX_SHIP_FROM", () => {
  const testCase = e2e(
    "Checkout with avataxShipFromAddress private metadata [pricesEnteredWithTax: False]",
  );

  const shipFromAddressMetadata = [
    {
      key: "avataxShipFromAddress",
      value: JSON.stringify({
        street: "123 Custom Ship Street",
        city: "Custom Ship City",
        state: "CA",
        zip: "90210",
        country: "US",
      }),
    },
  ];
  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 16.33;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.33;

  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.0;
  const SHIPPING_GROSS_PRICE = 75.31;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 7.33;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 91.64;

  it("should have created a checkout", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
        "@OVERRIDES@": {
          lines: [{ quantity: 10, variantId: "$M{Product.Juice.variantId}" }],
          channelSlug: "$M{Channel.USA.slug}",
        },
      })
      .expectStatus(200)
      .expectJson(
        "data.checkoutCreate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .stores("CheckoutId", "data.checkoutCreate.checkout.id");
  });

  it("should apply the shipFrom address private metadata to the checkout", async () => {
    await testCase
      .step("Update checkout with shipFrom address private metadata")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(UpdatePrivateMetadata)
      .withGraphQLVariables({
        id: "$S{CheckoutId}",
        input: shipFromAddressMetadata,
      })
      .expectStatus(200)
      .expectJson("data.updatePrivateMetadata.item.privateMetadata", shipFromAddressMetadata);
  });

  it("should update delivery method and calculate shipping price with custom shipFrom address", async () => {
    await testCase
      .step("Add delivery method")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutUpdateDeliveryMethod)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "UpdateDeliveryMethod:USA",
      })
      .expectStatus(200)
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
          currency: CURRENCY,
        }),
      );
  });

  it("should finalize the checkout with custom shipFrom address", async () => {
    await testCase
      .step("Complete checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CompleteCheckout)
      .withGraphQLVariables({ checkoutId: "$S{CheckoutId}" })
      .expectStatus(200)
      .expectJson(
        "data.checkoutComplete.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.checkoutComplete.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
          currency: CURRENCY,
        }),
      );
  });
});
