import { it, describe } from "vitest";
import { e2e } from "pactum";
import { string } from "pactum-matchers";
import {
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
} from "../generated/graphql";

// Testmo: https://saleor.testmo.net/repositories/6?case_id=16233
describe("App should calculate taxes for checkout with product without tax class [pricesEnteredWithTax: False]", () => {
  const testCase = e2e("Product without tax class [pricesEnteredWithTax: False]");

  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 300;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 26.63;
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 326.63;

  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.15;
  const SHIPPING_GROSS_PRICE = 75.46;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 369.31;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 32.78;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 402.09;

  it("should have taxes calculated on checkoutCreate", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
      })
      .expectStatus(200)
      .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .retry()
      .stores("CheckoutId", "data.checkoutCreate.checkout.id");
  });

  it("should have taxes calculated when shipping is added to checkout", async () => {
    await testCase
      .step("Add delivery method")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutUpdateDeliveryMethod)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "UpdateDeliveryMethod:USA",
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.tax", {
        currency: "USD",
        amount: TOTAL_TAX_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.net", {
        currency: "USD",
        amount: TOTAL_NET_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.gross", {
        currency: "USD",
        amount: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.tax", {
        currency: "USD",
        amount: SHIPPING_TAX_PRICE,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.net", {
        currency: "USD",
        amount: SHIPPING_NET_PRICE,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.gross", {
        currency: "USD",
        amount: SHIPPING_GROSS_PRICE,
      })
      .retry();
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
