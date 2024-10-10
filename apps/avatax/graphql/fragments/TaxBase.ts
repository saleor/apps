import { graphql } from "@/graphql";

import { AddressFragment } from "./AddressFragment";
import { UserFragment } from "./UserFragment";

export const TaxBaseFragment = graphql(
  `
    fragment TaxBaseLine on TaxableObjectLine {
      sourceLine {
        __typename
        ... on CheckoutLine {
          id
          checkoutProductVariant: variant {
            id
            product {
              taxClass {
                id
                name
              }
            }
          }
        }
        ... on OrderLine {
          id
          orderProductVariant: variant {
            id
            product {
              taxClass {
                id
                name
              }
            }
          }
        }
      }
      quantity
      unitPrice {
        amount
      }
      totalPrice {
        amount
      }
    }

    fragment TaxDiscount on TaxableObjectDiscount {
      amount {
        amount
      }
      type
    }

    fragment TaxBase on TaxableObject {
      pricesEnteredWithTax
      currency
      channel {
        slug
      }
      discounts {
        ...TaxDiscount
      }
      address {
        ...Address
      }
      shippingPrice {
        amount
      }
      lines {
        ...TaxBaseLine
      }
      sourceObject {
        __typename
        ... on Checkout {
          id
          avataxEntityCode: metafield(key: "avataxEntityCode")
          avataxCustomerCode: metafield(key: "avataxCustomerCode")
          user {
            ...User
          }
        }
        ... on Order {
          id
          avataxEntityCode: metafield(key: "avataxEntityCode")
          avataxCustomerCode: metafield(key: "avataxCustomerCode")
          user {
            ...User
          }
        }
      }
    }
  `,
  [UserFragment, AddressFragment],
);
