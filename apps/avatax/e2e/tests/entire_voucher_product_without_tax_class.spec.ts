import { e2e } from "pactum";
import { describe, it } from "vitest";
import {
  CheckoutAddVoucher,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckout,
  MoneyFragment,
} from "../generated/graphql";
import { string } from "pactum-matchers";

describe("App should calculate taxes for checkout with entire voucher applied [pricesEnteredWithTax: False]", () => {
  const testCase = e2e(
    "Product without tax claass [pricesEnteredWithTax: False], entire voucher applied",
  );

  const CURRENCY = "USD";

  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.33;
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 16.33;

  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.14;
  const SHIPPING_GROSS_PRICE = 75.45;

  const TOTAL_NET_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 7.48;
  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 91.79;

  const VOUCHER_AMOUNT = 2.25;

  const SHIPPING_NET_PRICE_AFTER_VOUCHER = 67.46;
  const SHIPPING_TAX_PRICE_AFTER_VOUCHER = 5.99;
  const SHIPPING_GROSS_PRICE_AFTER_VOUCHER = 73.45;
  const PRODUCT_NET_PRICE_AFTER_VOUCHER = 14.6;
  const PRODUCT_TAX_PRICE_AFTER_VOUCHER = 1.29;
  const PRODUCT_GROSS_PRICE_AFTER_VOUCHER = 15.89;
  const TOTAL_NET_PRICE_AFTER_VOUCHER = 82.06;
  const TOTAL_TAX_PRICE_AFTER_VOUCHER = 7.28;
  const TOTAL_GROSS_PRICE_AFTER_VOUCHER = 89.34;

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
      .step("Create checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateCheckout)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
        "@OVERRIDES@": {
          variantId: "$M{Product.Juice.variantId}",
        },
      })
      .expectStatus(200)
      .expectJson("data.checkoutCreate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      } as MoneyFragment)
      .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      } as MoneyFragment)
      .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      } as MoneyFragment)
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
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.net", {
        currency: "USD",
        amount: TOTAL_NET_PRICE_AFTER_SHIPPING,
      } as MoneyFragment)
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.gross", {
        currency: "USD",
        amount: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
      } as MoneyFragment)
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.tax", {
        currency: "USD",
        amount: TOTAL_TAX_PRICE_AFTER_SHIPPING,
      } as MoneyFragment)
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.net", {
        currency: "USD",
        amount: SHIPPING_NET_PRICE,
      } as MoneyFragment)
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.gross", {
        currency: "USD",
        amount: SHIPPING_GROSS_PRICE,
      } as MoneyFragment)
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.tax", {
        currency: "USD",
        amount: SHIPPING_TAX_PRICE,
      } as MoneyFragment)
      .retry();
  });

  it("should have taxes calculated when voucher is added to checkout", async () => {
    await testCase
      .step("Add voucher code")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CheckoutAddVoucher)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "AddVoucher:USA:Percentage",
      })
      .expectJson("data.checkoutAddPromoCode.checkout.discountName", "$M{Voucher.Percentage.name}")
      .expectJson("data.checkoutAddPromoCode.checkout.discount", getMoney(VOUCHER_AMOUNT))
      .expectJson(
        "data.checkoutAddPromoCode.checkout.lines[0].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_GROSS_PRICE_AFTER_VOUCHER,
          net: PRODUCT_NET_PRICE_AFTER_VOUCHER,
          tax: PRODUCT_TAX_PRICE_AFTER_VOUCHER,
        }),
      )
      .expectJson(
        "data.checkoutAddPromoCode.checkout.lines[0].undiscountedTotalPrice",
        getMoney(TOTAL_NET_PRICE_BEFORE_SHIPPING),
      )
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
