import { e2e } from "pactum";
import { describe, it } from "vitest";
import {
  CheckoutAddVoucher,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckoutWithTwoLines,
  MoneyFragment,
} from "../generated/graphql";
import { string } from "pactum-matchers";

describe("App should calculate taxes for checkout with cheapest voucher applied [pricedEnteredWithTax: False]", () => {
  const testCase = e2e(
    "Product without tax class [pricesEnteredWithTax: False], cheapest voucher applied",
  );

  const CURRENCY = "USD";

  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 41.7;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 469.9;
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 511.6;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 565.23;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 50.16;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 615.39;

  const SHIPPING_NET_PRICE = 95.33;
  const SHIPPING_TAX_PRICE = 8.45;
  const SHIPPING_GROSS_PRICE = 103.78;

  const PRODUCT_ONE_NET_PRICE_BEFORE_VOUCHER = 19.9;
  const PRODUCT_ONE_TAX_PRICE_BEFORE_VOUCHER = 1.77;
  const PRODUCT_ONE_GROSS_PRICE_BEFORE_VOUCHER = 21.67;

  const PRODUCT_ONE_NET_PRICE_AFTER_VOUCHER = 19.5;
  const PRODUCT_ONE_TAX_PRICE_AFTER_VOUCHER = 1.73;
  const PRODUCT_ONE_GROSS_PRICE_AFTER_VOUCHER = 21.23;

  const VOUCHER_AMOUNT = 0.4;

  const PRODUCT_TWO_NET_PRICE_BEFORE_VOUCHER = 450;
  const PRODUCT_TWO_TAX_PRICE_BEFORE_VOUCHER = 39.94;
  const PRODUCT_TWO_GROSS_PRICE_BEFORE_VOUCHER = 489.94;

  const PRODUCT_TWO_NET_PRICE_AFTER_VOUCHER = PRODUCT_TWO_NET_PRICE_BEFORE_VOUCHER;
  const PRODUCT_TWO_TAX_PRICE_AFTER_VOUCHER = PRODUCT_TWO_TAX_PRICE_BEFORE_VOUCHER;
  const PRODUCT_TWO_GROSS_PRICE_AFTER_VOUCHER = PRODUCT_TWO_GROSS_PRICE_BEFORE_VOUCHER;

  const TOTAL_NET_PRICE_AFTER_VOUCHER = 564.83;
  const TOTAL_TAX_PRICE_AFTER_VOUCHER = 50.13;
  const TOTAL_GROSS_PRICE_AFTER_VOUCHER = 614.96;

  const getMoney = (amount: number): MoneyFragment => {
    return {
      amount,
      currency: CURRENCY,
    };
  };

  const getCompleteMoney = ({ gross, net, tax }: { gross: number; net: number; tax: number }) => ({
    gross: getMoney(gross),
    net: getMoney(net),
    tax: getMoney(tax),
  });

  it("should have taxes calculated on checkoutCreate", async () => {
    await testCase
      .step("Create checkout with two lines")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckoutWithTwoLines)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "CheckoutTwoLines:USA",
        "@OVERRIDES@": {
          variantOneId: "$M{Product.Juice.variantId}",
          variantTwoId: "$M{Product.Shirt.variantId}",
        },
      })
      .expectStatus(200)
      .inspect("data")
      .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        currency: CURRENCY,
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: CURRENCY,
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: CURRENCY,
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
        "@OVERRIDES@": {
          checkoutId: "$S{CheckoutId}",
        },
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
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.lines[0].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_ONE_GROSS_PRICE_BEFORE_VOUCHER,
          net: PRODUCT_ONE_NET_PRICE_BEFORE_VOUCHER,
          tax: PRODUCT_ONE_TAX_PRICE_BEFORE_VOUCHER,
        }),
      )
      .expectJson(
        "data.checkoutDeliveryMethodUpdate.checkout.lines[1].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_TWO_GROSS_PRICE_BEFORE_VOUCHER,
          net: PRODUCT_TWO_NET_PRICE_BEFORE_VOUCHER,
          tax: PRODUCT_TWO_TAX_PRICE_BEFORE_VOUCHER,
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
        "@DATA:TEMPLATE@": "AddVoucher:USA:CheapestProductPercentage",
        "@OVERRIDES@": {
          checkoutId: "$S{CheckoutId}",
        },
      })
      .expectJson(
        "data.checkoutAddPromoCode.checkout.discountName",
        "$M{Voucher.CheapestProduct.name}",
      )
      .expectJson("data.checkoutAddPromoCode.checkout.discount", getMoney(VOUCHER_AMOUNT))
      .inspect("data")
      .expectJson(
        "data.checkoutAddPromoCode.checkout.lines[0].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_ONE_GROSS_PRICE_AFTER_VOUCHER,
          net: PRODUCT_ONE_NET_PRICE_AFTER_VOUCHER,
          tax: PRODUCT_ONE_TAX_PRICE_AFTER_VOUCHER,
        }),
      )
      .expectJson(
        "data.checkoutAddPromoCode.checkout.lines[1].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_TWO_GROSS_PRICE_AFTER_VOUCHER,
          net: PRODUCT_TWO_NET_PRICE_AFTER_VOUCHER,
          tax: PRODUCT_TWO_TAX_PRICE_AFTER_VOUCHER,
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
