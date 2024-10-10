import { graphql, ResultOf } from "@/graphql";

import { AddressFragment } from "./AddressFragment";
import { TaxBaseOrderLineFragment } from "./TaxBaseOrderLineFragment";
import { TaxDiscountFragment } from "./TaxDiscountFragment";
import { UserFragment } from "./UserFragment";

export const TaxBaseLineFragment = graphql(
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
          ...TaxBaseOrderLine
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
  [TaxBaseOrderLineFragment],
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
export type TaxBaseLineFragmentType = ResultOf<typeof TaxBaseLineFragment>;
