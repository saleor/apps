import { it, describe } from "vitest";
import { e2e } from "pactum";
import { string } from "pactum-matchers";
import { gql } from "../utils";

describe("Product without assigned tax class", () => {
  const testCase = e2e("Product without tax class");

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
      .withGraphQLQuery(gql`
        mutation CreateCheckout(
          $channelSlug: String!
          $variantId: ID!
          $email: String!
          $address: AddressInput!
        ) {
          checkoutCreate(
            input: {
              channel: $channelSlug
              lines: [{ quantity: 10, variantId: $variantId }]
              email: $email
              shippingAddress: $address
              billingAddress: $address
              languageCode: EN_US
            }
          ) {
            errors {
              field
              message
              code
              variants
              lines
              addressType
            }
            checkout {
              id
              totalPrice {
                net {
                  currency
                  amount
                }
                gross {
                  currency
                  amount
                }
                tax {
                  currency
                  amount
                }
              }
              shippingMethods {
                id
                name
                price {
                  currency
                  amount
                }
              }
            }
          }
        }
      `)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "Checkout:USA",
      })
      .expectStatus(200)
      .expectJson("data.checkoutCreate.checkout.totalPrice.net", {
        amount: TOTAL_NET_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
        amount: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
        currency: "USD",
      })
      .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
        amount: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
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
      .withGraphQLQuery(gql`
        mutation checkoutDeliveryMethodUpdate($checkoutId: ID!, $deliveryMethodId: ID!) {
          checkoutDeliveryMethodUpdate(id: $checkoutId, deliveryMethodId: $deliveryMethodId) {
            errors {
              ...CheckoutErrorFragment
            }
            checkout {
              id
              lines {
                totalPrice {
                  gross {
                    ...Money
                  }
                  tax {
                    ...Money
                  }
                }
              }
              shippingPrice {
                gross {
                  ...Money
                }
                tax {
                  ...Money
                }
                net {
                  ...Money
                }
              }
              totalPrice {
                net {
                  ...Money
                }
                gross {
                  ...Money
                }
                tax {
                  ...Money
                }
              }
            }
          }
        }

        fragment CheckoutErrorFragment on CheckoutError {
          message
          field
          code
        }

        fragment Money on Money {
          currency
          amount
        }
      `)
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
      })
      .retry();
  });

  it("checkout should be able to complete", async () => {
    await testCase
      .step("Complete checkout")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(gql`
        mutation CompleteCheckout($checkoutId: ID!) {
          checkoutComplete(id: $checkoutId) {
            order {
              id
            }
            confirmationNeeded
            confirmationData
            errors {
              field
              message
              code
              variants
              lines
              addressType
            }
          }
        }
      `)
      .withGraphQLVariables({ checkoutId: "$S{CheckoutId}" })
      .expectJsonMatch({
        data: {
          checkoutComplete: {
            order: {
              id: string(),
            },
          },
        },
      })
      .stores("OrderId", "data.checkoutComplete.order.id")
      .clean()
      .post("/grpahql/")
      .withGraphQLQuery(gql`
        mutation OrderCancel($orderId: ID!) {
          orderCancel(id: $orderId) {
            errors {
              field
              message
              code
            }
          }
        }
      `)
      .withGraphQLVariables({
        orderId: "$S{OrderId}",
      });
  });

  it("cleanup after tests", async () => {
    await testCase.cleanup();
  });
});
