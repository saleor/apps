import { e2e } from "pactum";
import { string } from "pactum-matchers";
import { describe, it } from "vitest";

import {
  CheckoutLinesUpdate,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
} from "../generated/graphql";
import { getCompleteMoney, getMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&pagination_current=2&case_id=24373
describe("App should calculate taxes for checkout with order promotion with subtotal reward TC: AVATAX_40", () => {
  const testCase = e2e(
    "pricesEnteredWithTax: False, promotion [type: ENTIRE_ORDER, discountValueType: PERCENTAGE]",
  );

  const CURRENCY = "USD";

  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 299.5;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 26.58;
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 326.08;

  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.15;
  const SHIPPING_GROSS_PRICE = 75.46;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 368.81;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 32.73;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 401.54;

  const PRODUCT_NET_PRICE_AFTER_PROMOTION = 449.25;
  const PRODUCT_TAX_PRICE_AFTER_PROMOTION = 39.87;
  const PRODUCT_GROSS_PRICE_AFTER_PROMOTION = 489.12;

  const TOTAL_NET_PRICE_INCLUDING_ORDER_PROMOTION = 518.56;
  const TOTAL_TAX_PRICE_INCLUDING_ORDER_PROMOTION = 46.02;
  const TOTAL_GROSS_PRICE_INCLUDING_ORDER_PROMOTION = 564.58;

  it("should have taxes calculated on checkoutCreate", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
        "@OVERRIDES@": {
          lines: [{ quantity: 1, variantId: "$M{Product.ExpensiveTshirt.variantId}" }],
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
      .stores("CheckoutId", "data.checkoutCreate.checkout.id")
      .stores("CheckoutLineId", "data.checkoutCreate.checkout.lines[0].id");
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
      )
      .retry();
  });

  it("should have taxes calculated when order promotion applies", async () => {
    await testCase
      .step("Add voucher code")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutLinesUpdate)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "UpdateLines",
      })
      .expectJson(
        "data.checkoutLinesUpdate.checkout.lines[0].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_GROSS_PRICE_AFTER_PROMOTION,
          net: PRODUCT_NET_PRICE_AFTER_PROMOTION,
          tax: PRODUCT_TAX_PRICE_AFTER_PROMOTION,
        }),
      )
      .expectJson(
        "data.checkoutLinesUpdate.checkout.lines[0].undiscountedUnitPrice",
        getMoney(TOTAL_NET_PRICE_BEFORE_SHIPPING),
      )
      .expectJson(
        "data.checkoutLinesUpdate.checkout.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
        }),
      )
      .expectJson(
        "data.checkoutLinesUpdate.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_INCLUDING_ORDER_PROMOTION,
          net: TOTAL_NET_PRICE_INCLUDING_ORDER_PROMOTION,
          tax: TOTAL_TAX_PRICE_INCLUDING_ORDER_PROMOTION,
        }),
      )
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
