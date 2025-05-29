import { e2e } from "pactum";
import { describe, it } from "vitest";

import {
  CheckoutAddBilling,
  CheckoutAddShipping,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckoutNoAddress,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/money";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=18385
describe("App should calculate taxes for checkout on update shipping address TC: AVATAX_21", () => {
  const testCase = e2e("Checkout for product with tax class [pricesEnteredWithTax: True]");

  const CURRENCY = "USD";

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const SHIPPING_GROSS_PRICE = 69.31;
  const SHIPPING_NET_PRICE = 63.65;
  const SHIPPING_TAX_PRICE = 5.66;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.43;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.88;

  const addressVerification = {
    city: "$M{Address.NewYork.city}",
    streetAddress1: "$M{Address.NewYork.streetAddress1}",
    postalCode: "$M{Address.NewYork.postalCode}",
  };

  it("should have created a checkout", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckoutNoAddress)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:PricesWithTax",
        "@OVERRIDES@": {
          lines: [{ quantity: 10, variantId: "$M{Product.Juice.variantId}" }],
          channelSlug: "$M{Channel.PricesWithTax.slug}",
        },
      })
      .expectStatus(200)
      .expectJson(
        "data.checkoutCreate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          tax: 0,
          currency: CURRENCY,
        }),
      )
      .stores("CheckoutId", "data.checkoutCreate.checkout.id");
  });

  it("should add a valid shipping address", async () => {
    await testCase
      .step("Add shipping address")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutAddShipping)
      .withGraphQLVariables({
        id: "$S{CheckoutId}",
        shippingAddress: "$M{Address.NewYork}",
      })
      .expectStatus(200)
      .inspect()
      .expectJsonLike(
        "data.checkoutShippingAddressUpdate.checkout.shippingAddress",
        addressVerification,
      )
      .expectJson("data.checkoutShippingAddressUpdate.checkout.billingAddress", null)
      .expectJson(
        "data.checkoutShippingAddressUpdate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
          currency: CURRENCY,
        }),
      );
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
        "data.checkoutBillingAddressUpdate.checkout.shippingAddress",
        addressVerification,
      )
      .expectJsonLike(
        "data.checkoutBillingAddressUpdate.checkout.billingAddress",
        addressVerification,
      )
      .expectJson(
        "data.checkoutBillingAddressUpdate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
          currency: CURRENCY,
        }),
      );
  });

  it("should update delivery method and calculate shipping price", async () => {
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

  it("should finalize the checkout", async () => {
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
      )
      .stores("OrderID", "data.checkoutComplete.order.id");
  });
});
