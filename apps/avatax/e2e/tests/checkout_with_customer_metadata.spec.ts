/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { describe, it } from "vitest";

import {
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
  UpdateMetadata,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=16247
describe("App should exempt taxes for checkout with metadata avataxCustomerCode TC: AVATAX_15", () => {
  const testCase = e2e("Checkout with avataxCustomerCode  [pricesEnteredWithTax: False]");

  const metadata = [
    {
      key: "avataxCustomerCode",
      value: "SHOPX",
    },
  ];
  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 16.33;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.33;

  const SHIPPING_NET_PRICE = 69.31;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 84.31;

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
  it("should apply the customer metadata to the checkout", async () => {
    await testCase
      .step("Update checkout with customer metadata")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(UpdateMetadata)
      .withGraphQLVariables({
        id: "$S{CheckoutId}",
        input: metadata,
      })
      .expectStatus(200)
      .expectJson("data.updateMetadata.item.metadata", metadata);
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
          gross: TOTAL_NET_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: 0,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_NET_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: 0,
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
          gross: TOTAL_NET_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: 0,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.checkoutComplete.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_NET_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: 0,
          currency: CURRENCY,
        }),
      );
  });
});
