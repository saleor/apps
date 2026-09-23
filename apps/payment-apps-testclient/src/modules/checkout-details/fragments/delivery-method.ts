import { graphql } from "@/graphql/gql";

export const ShippingMethodFragment = graphql(`
  fragment ShippingMethod on ShippingMethod {
    id
    name
    price {
      amount
      currency
    }
  }
`);

export const DeliveryMethodFragment = graphql(`
  fragment DeliveryMethod on ShippingMethod {
    id
  }
`);

export const CollectionPointFragment = graphql(`
  fragment CollectionPoint on Warehouse {
    id
  }
`);
