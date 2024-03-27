/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { it, describe } from "vitest";
import {
  CheckoutAddBilling,
  CheckoutAddShipping,
  CheckoutUpdateDeliveryMethod,
  CompleteCheckout,
  CreateCheckoutNoAddress,
  OrderDetails,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { string } from "pactum-matchers";

describe("App should calculate taxes for checkout with product tax [pricesEnteredWithTax: True]", () => {
  const testCase = e2e("Checkout for product with tax class [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: process.env.E2E_USER_NAME as string,
    password: process.env.E2E_USER_PASSWORD as string,
  };

  const CURRENCY = "USD";

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const SHIPPING_GROSS_PRICE = 69.31;
  const SHIPPING_NET_PRICE = 63.66;
  const SHIPPING_TAX_PRICE = 5.65;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.44;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.87;

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
          variantId: "$M{Product.Juice.variantId}",
          channelSlug: "$M{Channel.PricesWithTax.slug}",
        },
      })
      .expectStatus(200)
      .expectJson("data.checkoutCreate.checkout.totalPrice.net", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING, // no taxes are calculated yet
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
        amount: 0,
        currency: "USD",
      })
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
      .expectJson("data.checkoutShippingAddressUpdate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutShippingAddressUpdate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutShippingAddressUpdate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      });
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
      .expectJson("data.checkoutBillingAddressUpdate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutBillingAddressUpdate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutBillingAddressUpdate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      });
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
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.net", {
        currency: "USD",
        amount: TOTAL_NET_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.gross", {
        currency: "USD",
        amount: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.tax", {
        currency: "USD",
        amount: TOTAL_TAX_PRICE_AFTER_SHIPPING,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.net", {
        currency: "USD",
        amount: SHIPPING_NET_PRICE,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.gross", {
        currency: "USD",
        amount: SHIPPING_GROSS_PRICE,
      })
      .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.tax", {
        currency: "USD",
        amount: SHIPPING_TAX_PRICE,
      });
  });

  it("should finalize the checkout", async () => {
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
              total: {
                gross: {
                  amount: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
                net: {
                  amount: TOTAL_NET_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
                tax: {
                  amount: TOTAL_TAX_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
              },
              shippingPrice: {
                gross: {
                  amount: SHIPPING_GROSS_PRICE,
                  currency: CURRENCY,
                },
                net: {
                  amount: SHIPPING_NET_PRICE,
                  currency: CURRENCY,
                },
                tax: {
                  amount: SHIPPING_TAX_PRICE,
                  currency: CURRENCY,
                },
              },
            },
          },
        },
      })
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
      .stores("StaffUserToken", "data.tokenCreate.token");
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
