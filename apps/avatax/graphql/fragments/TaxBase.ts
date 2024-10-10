import { graphql, ResultOf } from "@/graphql";

import { AddressFragment } from "./AddressFragment";
import { OrderLineFragment } from "./OrderLineFragment";
import { TaxDiscountFragment } from "./TaxDiscountFragment";
import { UserFragment } from "./UserFragment";

const TaxBaseLineFragment = graphql(
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
          ...OrderLine
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
  `,
  [OrderLineFragment],
);

export const TaxBaseFragment = graphql(
  `
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
  [UserFragment, AddressFragment, TaxDiscountFragment, TaxBaseLineFragment],
);

export type TaxBaseFragmentType = ResultOf<typeof TaxBaseFragment>;
