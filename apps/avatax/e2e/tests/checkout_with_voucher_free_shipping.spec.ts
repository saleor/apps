import { e2e } from "pactum";
import { string } from "pactum-matchers";
import { describe, it } from "vitest";

import {
  CheckoutAddVoucher,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
} from "../generated/graphql";
import { getCompleteMoney, getMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=16237
describe("App should calculate taxes for checkout with free shipping voucher applied TC: AVATAX_6", () => {
  const testCase = e2e(
    "Product with tax class [pricesEnteredWithTax: False], voucher [type: SHIPPING, discountValueType: PERCENTAGE]",
  );

  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.33;
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 16.33;

  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.14;
  const SHIPPING_GROSS_PRICE = 75.45;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 7.48;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 91.79;

  const VOUCHER_AMOUNT = SHIPPING_NET_PRICE;

  const SHIPPING_NET_PRICE_AFTER_VOUCHER = 0;
  const SHIPPING_TAX_PRICE_AFTER_VOUCHER = 0;
  const SHIPPING_GROSS_PRICE_AFTER_VOUCHER = 0;

  const TOTAL_NET_PRICE_AFTER_VOUCHER = TOTAL_NET_PRICE_BEFORE_SHIPPING;
  const TOTAL_TAX_PRICE_AFTER_VOUCHER = TOTAL_TAX_PRICE_BEFORE_SHIPPING;
  const TOTAL_GROSS_PRICE_AFTER_VOUCHER = TOTAL_GROSS_PRICE_BEFORE_SHIPPING;

  it("should have taxes calculated on checkoutCreate", async () => {
    await testCase
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
        "@OVERRIDES@": {
          lines: [{ quantity: 10, variantId: "$M{Product.Juice.variantId}" }],
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

  it("should have taxes calculated when voucher is added to checkout", async () => {
    await testCase
      .step("Add voucher code")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutAddVoucher)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "AddVoucher:USA:FreeShipping",
      })
      .expectJson(
        "data.checkoutAddPromoCode.checkout.discountName",
        "$M{Voucher.FreeShipping.name}",
      )
      .expectJson("data.checkoutAddPromoCode.checkout.discount", getMoney(VOUCHER_AMOUNT))
      .expectJson(
        "data.checkoutAddPromoCode.checkout.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE_AFTER_VOUCHER,
          net: SHIPPING_NET_PRICE_AFTER_VOUCHER,
          tax: SHIPPING_TAX_PRICE_AFTER_VOUCHER,
        }),
      )
      .expectJson(
        "data.checkoutAddPromoCode.checkout.totalPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_VOUCHER,
          net: TOTAL_NET_PRICE_AFTER_VOUCHER,
          tax: TOTAL_TAX_PRICE_AFTER_VOUCHER,
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
