import { it } from "vitest";
import { spec } from "pactum";

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
    });
});
