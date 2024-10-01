/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { string } from "pactum-matchers";
import { describe, it } from "vitest";

import {
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
  OrderDetails,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=18384
describe("App should calculate taxes for checkout with product with tax class TC: AVATAX_20", () => {
  const testCase = e2e("Checkout for product with tax class [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: process.env.E2E_USER_NAME as string,
    password: process.env.E2E_USER_PASSWORD as string,
  };

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const SHIPPING_GROSS_PRICE = 69.31;
  const SHIPPING_NET_PRICE = 63.66;
  const SHIPPING_TAX_PRICE = 5.65;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.44;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.87;

  it("should have created a checkout", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
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
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        }),
      )
      .stores("CheckoutId", "data.checkoutCreate.checkout.id");
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
        }),
      )
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
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
        }),
      )
      .expectJson(
        "data.checkoutComplete.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
        }),
      )
      .stores("OrderID", "data.checkoutComplete.order.id");
  });

  /*
   * It takes few seconds for metadata do be populated with `avataxId` key
   * That's why we need to do it in a separate step
   */
  it("creates token for staff user", async () => {
    await testCase
      .step("Create token for staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(StaffUserTokenCreate)
      .withGraphQLVariables(staffCredentials)
      .expectStatus(200)
      .expectJsonLike({
        data: {
          tokenCreate: {
            token: "typeof $V === 'string'",
          },
        },
      })
      .stores("StaffUserToken", "data.tokenCreate.token")
      .retry();
  });

  it("should have metadata with 'avataxId' key", async () => {
    await testCase
      .step("Check if order has metadata with 'avataxId' key")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(OrderDetails)
      .withGraphQLVariables({
        id: "$S{OrderID}",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJsonLike("data.order.metadata[key=avataxId]", {
        key: "avataxId",
        value: "typeof $V === 'string'",
      })
      .retry(4, 2000);
  });
});
