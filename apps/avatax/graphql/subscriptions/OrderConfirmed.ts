import { graphql, ResultOf } from "@/graphql";

import { AddressFragment } from "../fragments/AddressFragment";
import { UserFragment } from "../fragments/UserFragment";
import { WebhookMetadata } from "../fragments/WebhookMetadata";

const OrderLineFragment = graphql(`
  fragment OrderLine on OrderLine {
    productSku
    productVariantId
    productName
    quantity
    taxClass {
      id
    }
    unitPrice {
      net {
        amount
      }
    }
    totalPrice {
      net {
        amount
      }
      tax {
        amount
      }
      gross {
        amount
      }
    }
  }
`);

const OrderConfirmedFragment = graphql(
  `
    fragment OrderConfirmed on Order {
      id
      number
      userEmail
      user {
        ...User
      }
      avataxCustomerCode: metafield(key: "avataxCustomerCode")
      created
      status
      channel {
        id
        slug
        taxConfiguration {
          pricesEnteredWithTax
          taxCalculationStrategy
        }
      }
      shippingAddress {
        ...Address
      }
      billingAddress {
        ...Address
      }
      total {
        currency
        net {
          amount
        }
        tax {
          amount
        }
      }
      shippingPrice {
        gross {
          amount
        }
        net {
          amount
        }
      }
      lines {
        ...OrderLine
      }
      avataxEntityCode: metafield(key: "avataxEntityCode")
      avataxTaxCalculationDate: metafield(key: "avataxTaxCalculationDate")
      avataxDocumentCode: metafield(key: "avataxDocumentCode")
    }
  `,
  [AddressFragment, OrderLineFragment, UserFragment],
);

const OrderConfirmedEventFragment = graphql(
  `
    fragment OrderConfirmedEventSubscription on Event {
      __typename
      ...WebhookMetadata
      ... on OrderConfirmed {
        order {
          ...OrderConfirmed
        }
      }
      recipient {
        privateMetadata {
          key
          value
        }
      }
    }
  `,
  [WebhookMetadata, OrderConfirmedFragment],
);

export const OrderConfirmedSubscription = graphql(
  `
    subscription OrderConfirmedSubscription {
      event {
        ...OrderConfirmedEventSubscription
      }
    }
  `,
  [OrderConfirmedEventFragment],
);

export type OrderConfirmedFragmentType = ResultOf<typeof OrderConfirmedFragment>;
