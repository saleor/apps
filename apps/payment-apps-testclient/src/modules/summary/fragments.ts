import { graphql } from "@/graphql/gql";

export const CheckoutFragment = graphql(`
  fragment Checkout on Checkout {
    id
    created
    billingAddress {
      firstName
      lastName
      streetAddress1
      city
      postalCode
      country {
        code
        country
      }
      countryArea
      phone
    }
    shippingAddress {
      firstName
      lastName
      streetAddress1
      city
      postalCode
      countryArea
      country {
        code
        country
      }
      phone
    }
    email
    totalPrice {
      gross {
        amount
      }
      currency
    }
    subtotalPrice {
      gross {
        amount
      }
      currency
    }
    shippingPrice {
      gross {
        amount
      }
      currency
    }
    lines {
      id
      variant {
        product {
          name
        }
      }
      quantity
      totalPrice {
        gross {
          amount
        }
        currency
      }
    }
  }
`);
