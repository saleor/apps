import { it } from "vitest";
import { handler, spec } from "pactum";
import { string } from "pactum-matchers";

// Trick editor into highlighting gql, wihtout parsing
const gql = String.raw;

it("should return taxes for product without taxes", async () => {
  await spec()
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
    .expectJson("data.checkoutCreate.checkout.totalPrice.gross", {
      amount: 326.63,
      currency: "USD",
    })
    .expectJson("data.checkoutCreate.checkout.totalPrice.tax", {
      amount: 26.63,
      currency: "USD",
    })
    .stores("CheckoutId", "data.checkoutCreate.checkout.id");

  await spec()
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
            }
            totalPrice {
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
    .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.gross", {
      currency: "USD",
      amount: 402.09,
    })
    .expectJson("data.checkoutDeliveryMethodUpdate.checkout.totalPrice.tax", {
      currency: "USD",
      amount: 32.78,
    })
    .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.gross", {
      currency: "USD",
      amount: 75.46,
    })
    .expectJson("data.checkoutDeliveryMethodUpdate.checkout.shippingPrice.tax", {
      currency: "USD",
      amount: 6.15,
    });

  await spec()
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
    });
});
